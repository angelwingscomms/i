<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import { toast } from '$lib/util/toast';
	import axios from 'axios';
	import { marked } from 'marked';

	let { data } = $props();
	let post = $state(data.p);
	let instructions = $state('');
	let loading = $state(false);
	let showPreview = $state(false);
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
					`/posts/${post.i}`,
					{ b: body }
				);
				if (res.status === 200) {
					toast.success('Post auto-saved');
				}
			} catch (e) {
				console.error('Auto-save failed', e);
			}
			saving = false;
			timeout = null;
		}, 1440);
	};

	$effect(() => {
		if (post.b) {
			saveWithDelay(post.b);
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
				`/posts/${post.i}/edit/gemini`,
				instructions
			);
			if (res.statusText === 'OK') {
				toast.success('Post updated with AI');
				post.b = res.data;
				instructions = '';
			} else {
				toast.error(
					res.data || 'Failed to update post'
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
		<h1 class="text-2xl font-bold">Edit Post</h1>
		<div class="flex items-center gap-2">
			{#if saving}
				<span class="text-sm text-gray-500"
					>Saving...</span
				>
			{/if}
			<a href={`/posts/${post.i}`} class="btn-outline"
				>View Post</a
			>
		</div>
	</div>
	<div class="space-y-6">
		<div class="space-y-2">
			<DescriptionInput
				bind:value={post.b}
				endpoint="/posts/edit"
				placeholder="Update your post content..."
				rows={10}
				bind:ref={ai_input}
				label="Post Content"
				editable={true}
			/>
		</div>
		<div class="space-y-2">
			<DescriptionInput
				bind:value={instructions}
				endpoint=""
				placeholder="e.g., Add more details, make it shorter, improve language..."
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
					? 'hide preview'
					: 'show preview'}
				onclick={() => (showPreview = !showPreview)}
			/>
			{#if showPreview}
				<div class="mt-4 rounded-lg p-4">
					<h2 class="mb-2 text-xl font-semibold">
						Preview
					</h2>
					{@html marked.parse(post.b || '')}
				</div>
			{/if}
		</div>
	</div>
</div>
