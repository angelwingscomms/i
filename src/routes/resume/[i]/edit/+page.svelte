<script lang="ts">
	import Color from '$lib/components/Color.svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { toast } from '$lib/util/toast.svelte.js';
	import axios from 'axios';

	let { data } = $props();
	let resume = $state({
		...data.r,
		h: data.r.h || ''
	});
	let instructions = $state('');
	let loading = $state(false);
	let show_preview = $state(false);
	let show_html_editor = $state(false);
	let saving = $state(false);
	let timeout: NodeJS.Timeout | null = null;
	let ai_input: HTMLTextAreaElement | null =
		$state(null);

	$effect(() => {
		if (!resume.h) {
			return;
		}
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(async () => {
			saving = true;
			try {
				const res = await axios.put(
					`/resume/${resume.i}`,
					resume.h
				);
				if (res.status !== 200) {
					toast.error('save error occurred');
				}
			} catch (err) {
				toast.error('save error occurred');
			}
			saving = false;
			timeout = null;
		}, 1440);
	});

	const handle_key_down = (event: KeyboardEvent) => {
		if (
			event.ctrlKey &&
			event.key === 'Enter' &&
			!loading
		) {
			const active = document.activeElement;
			if (active && active === ai_input) {
				event.preventDefault();
				edit_with_gemini();
			}
		}
	};

	const edit_with_gemini = async () => {
		if (!instructions.trim()) {
			toast.error('add edit instructions first');
			return;
		}
		loading = true;
		try {
			const res = await axios.post(
				`/resume/${resume.i}/edit/gemini`,
				instructions
			);
			if (res.status === 200) {
				resume = { ...resume, h: res.data.h };
				instructions = '';
				toast.success('resume updated');
			} else {
				toast.error('failed to update resume');
			}
		} catch (err) {
			toast.error('an error occurred');
		} finally {
			loading = false;
		}
	};
</script>

<svelte:window onkeydown={handle_key_down} />

<div class="mx-auto max-w-2xl p-4">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-2xl font-bold">edit resume</h1>
		<div class="flex items-center gap-2">
			{#if saving}
				<span class="text-sm text-gray-500"
					>saving...</span
				>
			{/if}
			<a
				href={`/resume/${resume.i}`}
				class="btn-outline">view resume</a
			>
		</div>
	</div>
	<div class="space-y-6">
		<div class="space-y-2">
			<label class="block text-sm font-medium"
				>color palette</label
			>
			<Color />
		</div>
		<div class="space-y-2">
			<DescriptionInput
				bind:value={instructions}
				bind:ref={ai_input}
				placeholder="e.g., add a skills section, make it more modern, change layout..."
				rows={4}
				label="ai edit instructions"
				editable={true}
				send={edit_with_gemini}
				send_loading={loading}
			/>
		</div>
		<div class="space-y-2">
			<Button
				text={show_preview
					? 'hide preview'
					: 'show preview'}
				onclick={() => (show_preview = !show_preview)}
			/>
			<Modal bind:open={show_preview} title="preview">
				<iframe
					srcdoc={resume.h}
					class="h-96 w-full rounded border border-gray-300"
				></iframe>
			</Modal>
		</div>
		<div class="space-y-2">
			<Button
				text={show_html_editor
					? 'hide html'
					: 'show html'}
				onclick={() =>
					(show_html_editor = !show_html_editor)}
			/>
			<Modal
				bind:open={show_html_editor}
				title="edit html"
			>
				<DescriptionInput
					bind:value={resume.h}
					placeholder="edit resume html here..."
					rows={20}
					label="resume html"
					editable={true}
				/>
			</Modal>
		</div>
	</div>
</div>
