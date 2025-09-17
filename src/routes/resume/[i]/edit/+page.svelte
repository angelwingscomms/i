<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import { toast } from '$lib/util/toast';
	import { onMount } from 'svelte';

	let { data } = $props();
	let resume = $state(data.r);
	let instructions = $state('');
	let loading = $state(false);

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
				body: JSON.stringify({ instructions })
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

<div class="page pad">
	<h1 class="title">Edit Resume</h1>
	<div class="gap">
		<DescriptionInput
			value={resume.txt || ''}
			endpoint="/resume/edit"
			placeholder="Update your resume content..."
			rows={10}
			label="Resume Content"
			editable={true}
		/>
	</div>
	<div class="gap">
		<label class="label" for="ai-instructions"
			>AI Edit Instructions</label
		>
		<textarea
			bind:value={instructions}
			class="input-underline"
			rows={4}
			placeholder="e.g., Add a skills section, make it more modern, change layout..."
		></textarea>
		<button
			class="btn-primary"
			onclick={editWithGemini}
			disabled={loading || !instructions.trim()}
		>
			{loading ? 'Updating...' : 'Update with AI'}
		</button>
	</div>
	{#if resume.h}
		<div class="resume-preview mt-lg">
			<h2 class="subtitle">Preview</h2>
			<iframe srcdoc={resume.h} class="preview-iframe"
			></iframe>
		</div>
	{/if}
</div>

<style>
	.page {
		max-width: 800px;
		margin: 0 auto;
	}
	.pad {
		padding: 16px;
	}
	.title {
		font-size: 22px;
		font-weight: 700;
		margin-bottom: 16px;
	}
	.gap {
		display: grid;
		gap: 8px;
		margin-bottom: 24px;
	}
	.label {
		font-size: 12px;
		color: var(--muted);
	}
	.input-underline {
		border: none;
		border-bottom: 1px solid var(--border);
		background: transparent;
		padding: 8px 0;
		width: 100%;
		resize: vertical;
		color: var(--text);
	}
	.btn-primary {
		background: var(--btn-primary);
		color: var(--btn-text);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 12px 24px;
		font-weight: 600;
		cursor: pointer;
		width: fit-content;
	}
	.subtitle {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 8px;
	}
	.resume-preview {
		background: var(--bg-secondary);
		border-radius: 12px;
		padding: 16px;
	}
	.preview-iframe {
		width: 100%;
		height: 600px;
		border: 1px solid var(--border);
		border-radius: 8px;
	}
	.mt-lg {
		margin-top: 24px;
	}
</style>
