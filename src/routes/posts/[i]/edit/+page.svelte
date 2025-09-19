<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	// import TextInput from '$lib/components/ui/TextInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import { toast } from '$lib/util/toast';
	import axios from 'axios';
	import { md } from '$lib/util/marked';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let post = $state(data.p);
	let instructions = $state('');
	let loading = $state(false);
	let showPreview = $state(false);
	let saving = $state(false);
	let timeout: NodeJS.Timeout | null = null;
	let ai_input: HTMLTextAreaElement | null = $state(null);

	const saveWithDelay = async (body: string) => {
		if (!post.t && !body) return;
		
		saving = true;
		if (timeout) {
			clearTimeout(timeout);
		}
		
		timeout = setTimeout(async () => {
			try {
				const formData = new FormData();
				formData.append('t', post.t || '');
				formData.append('b', body);
				
				const res = await axios.put(`/posts/${post.i}`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				});
				
				if (res.status === 200) {
					toast.success('Post auto-saved');
				}
			} catch (e) {
				console.error('Auto-save failed:', e);
				toast.error('Failed to auto-save post');
			} finally {
				saving = false;
				timeout = null;
			}
		}, 1500); // Increased delay slightly for better performance
	};

	$effect(() => {
		if (post.b !== undefined) {
			saveWithDelay(post.b || '');
		}
	});

	$effect(() => {
		if (post.t !== undefined) {
			saveWithDelay(post.b || '');
		}
	});

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.ctrlKey && e.key === 'Enter' && !loading && ai_input) {
			const activeEl = document.activeElement;
			if (activeEl === ai_input) {
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
			
			if (res.data) {
				toast.success('Post updated with AI');
				post.b = res.data;
				instructions = '';
			} else {
				throw new Error('No response data');
			}
		} catch (e: any) {
			console.error('AI edit failed:', e);
			toast.error(e.response?.data || 'Failed to update post with AI');
		} finally {
			loading = false;
		}
	}

	async function deletePost() {
		if (!confirm('Are you sure you want to delete this post?')) {
			return;
		}

		try {
			await axios.delete(`/posts/${post.i}`);
			toast.success('Post deleted');
			goto('/posts');
		} catch (e) {
			console.error('Delete failed:', e);
			toast.error('Failed to delete post');
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="mx-auto max-w-2xl p-4">
	<div class="mb-4 flex items-center justify-between">
		<h1 class="text-2xl font-bold">Edit Post</h1>
		<div class="flex items-center gap-2">
			{#if saving}
				<span class="text-sm text-gray-500">Saving...</span>
			{/if}
			<a href={`/posts/${post.i}`} class="btn-outline">View Post</a>
			<Button text="Delete" onclick={deletePost} />
		</div>
	</div>
	<div class="space-y-6">
		<div class="space-y-2">
			<!-- <TextInput
				bind:value={post.t}
				placeholder="Enter post title"
				label="Title"
			/> -->
		</div>
		<div class="space-y-2">
			<DescriptionInput
				bind:value={post.b}
				placeholder="Update your post content..."
				rows={10}
				bind:ref={ai_input}
				label="Post Content"
				editable={true}
				send_button={false}
			/>
		</div>
		<div class="space-y-2">
			<DescriptionInput
				bind:value={instructions}
				placeholder="e.g., Add more details, make it shorter, improve language..."
				rows={4}
				label="AI Edit Instructions"
				editable={true}
			/>
			<Button
				text={loading ? 'Updating...' : 'Update with AI'}
				onclick={editWithGemini}
				{loading}
				disabled={loading || !instructions.trim()}
			/>
		</div>
		<div class="space-y-2">
			<Button
				text={showPreview ? 'Hide Preview' : 'Show Preview'}
				onclick={() => (showPreview = !showPreview)}
			/>
			{#if showPreview}
				<div class="mt-4 rounded-lg p-4">
					<h2 class="mb-2 text-xl font-semibold">Preview</h2>
					<h1 class="mb-4 text-2xl font-bold">{post.t || 'Untitled'}</h1>
					{@html md(post.b || '')}
				</div>
			{/if}
		</div>
	</div>
</div>
