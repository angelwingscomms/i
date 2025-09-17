<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { toast } from '$lib/util/toast';
	import axios from 'axios';

	let { data } = $props();
	console.log('data', data);
	let resume = $state({
		...data.r,
		h: data.r.h || ''
	});
	console.log('resume.i', resume.i);
	let instructions = $state('');
	let loading = $state(false);
	let showPreview = $state(false);
	let showHtmlEditor = $state(false);
	let saving = $state(false);
	let timeout: NodeJS.Timeout | null = null;
	let ai_input: HTMLTextAreaElement | null =
		$state(null);

	const saveWithDelay = (body: string) => {
		saving = true;
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(async () => {
			try {
				const res = await axios.put(
					`/resume/${resume.i}`,
					{ h: body }
				);
				if (res.status === 200) {
					toast.success('HTML auto-saved');
				}
			} catch (e) {
				console.error('Auto-save failed', e);
			}
			saving = false;
			timeout = null;
		}, 1440);
	};

	$effect(() => {
		if (resume.h) {
			saveWithDelay(resume.h);
		}
	});

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.ctrlKey && e.key === 'Enter' && !loading) {
			const activeEl = document.activeElement;
			if (activeEl && activeEl === ai_input) {
				e.preventDefault();
				editWithGemini();
			}
		}
	};

	async function editWithGemini() {
		if (!instructions.trim()) {
			toast.error('Please enter edit instructions');
			return;
		}
		loading = true;
		try {
			const res = await axios.post(
				`/resume/${resume.i}/edit/gemini`,
				instructions
			);
			if (res.statusText === 'OK') {
				toast.success('Resume updated with AI');
				resume = {
					...res.data.resume,
					h: res.data.resume.h || ''
				};
				instructions = '';
			} else {
				toast.error(
					res.data || 'Failed to update resume'
				);
			}
		} catch (e) {
			toast.error('An error occurred');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="mx-auto max-w-2xl p-4">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-2xl font-bold">Edit Resume</h1>
		<div class="flex items-center gap-2">
			{#if saving}
				<span class="text-sm text-gray-500"
					>Saving...</span
				>
			{/if}
			<a
				href={`/resume/${resume.i}`}
				class="btn-outline">View Resume</a
			>
		</div>
	</div>
	<div class="space-y-6">
		<div class="space-y-2">
			<DescriptionInput
				bind:value={instructions}
				endpoint=""
				bind:ref={ai_input}
				placeholder="e.g., Add a skills section, make it more modern, change layout..."
				rows={4}
				label="AI Edit Instructions"
				editable={true}
			/>
			<Button
				text={loading
					? 'Updating...'
					: 'Update with AI'}
				onclick={editWithGemini}
				{loading}
				disabled={loading || !instructions.trim()}
			/>
		</div>
		<div class="space-y-2">
			<Button
				text={showPreview
					? 'Hide Preview'
					: 'Show Preview'}
				onclick={() => (showPreview = !showPreview)}
			/>
			<Modal bind:open={showPreview} title="Preview">
				<iframe
					srcdoc={resume.h}
					class="h-96 w-full rounded border border-gray-300"
				></iframe>
			</Modal>
		</div>
		<div class="space-y-2">
			<Button
				text={showHtmlEditor
					? 'Hide HTML'
					: 'Show HTML'}
				onclick={() =>
					(showHtmlEditor = !showHtmlEditor)}
			/>
			<Modal
				bind:open={showHtmlEditor}
				title="Edit HTML"
			>
				<DescriptionInput
					bind:value={resume.h}
					endpoint=""
					placeholder="Edit resume HTML here..."
					rows={20}
					label="Resume HTML"
					editable={true}
				/>
			</Modal>
		</div>
	</div>
</div>
