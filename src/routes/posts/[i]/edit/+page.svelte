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

<div class="mx-auto max-w-2xl p-4">
	<h1 class="mb-4 text-2xl font-bold">Edit Post</h1>
	<div class="space-y-6">
		<div class="space-y-2">
			<DescriptionInput
				value={post.b || ''}
				endpoint="/posts/edit"
				placeholder="Update your post content..."
				rows={10}
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
					{@html marked.parse(post.b)}
				</div>
			{/if}
		</div>
	</div>
</div>
