<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import { toast } from '$lib/util/toast';
	import { onMount } from 'svelte';

	let { data } = $props();
	let resume = $state(data.r);
	let instructions = $state('');
	let loading = $state(false);
	let showPreview = $state(false);

	async function editWithGemini() {
		if (!instructions.trim()) {
			toast.error('Please enter edit instructions');
			return;
		}
		loading = true;
		try {
			const res = await fetch('/resume/gemini', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ i: resume.i, instructions })
			});
			if (res.ok) {
				toast.success('Resume updated with AI');
				const updated = await res.json();
				resume = updated.resume;
				instructions = '';
			} else {
				const err = await res.text();
				toast.error(err || 'Failed to update resume');
			}
		} catch (e) {
			toast.error('An error occurred');
		} finally {
			loading = false;
		}
	}
</script>

<div class="max-w-2xl mx-auto p-4">
	<h1 class="text-2xl font-bold mb-4">Edit Resume</h1>
	<div class="space-y-6">
		<div class="space-y-2">
			<DescriptionInput
				value={resume.txt || ''}
				endpoint="/resume/edit"
				placeholder="Update your resume content..."
				rows={10}
				label="Resume Content"
				editable={true}
			/>
		</div>
		<div class="space-y-2">
			<DescriptionInput
				bind:value={instructions}
				endpoint=""
				placeholder="e.g., Add a skills section, make it more modern, change layout..."
				rows={4}
				label="AI Edit Instructions"
				editable={true}
			/>
			<Button
				text={loading ? 'Updating...' : 'Update with AI'}
				onclick={editWithGemini}
				loading={loading}
				disabled={loading || !instructions.trim()}
			/>
		</div>
		<div class="space-y-2">
			<Button
				text={showPreview ? 'Hide Resume Content' : 'Show Resume Content'}
				onclick={() => showPreview = !showPreview}
			/>
			{#if showPreview && resume.h}
				<div class="bg-gray-100 rounded-lg p-4 mt-4">
					<h2 class="text-xl font-semibold mb-2">Preview</h2>
					<iframe srcdoc={resume.h} class="w-full h-96 border border-gray-300 rounded"></iframe>
				</div>
			{/if}
		</div>
	</div>
</div>


