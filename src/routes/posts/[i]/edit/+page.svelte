<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	// import TextInput from '$lib/components/ui/TextInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import { toast } from '$lib/util/toast';
	import axios from 'axios';
	import Modal from '$lib/components/Modal.svelte';
	import { goto } from '$app/navigation';
	import { md } from '$lib/util/marked.js';

	let { data } = $props();
	let post = $state(data.p);
	let instructions = $state('');
	let loading = $state(false);
	let saving = $state(false);
	let timeout: NodeJS.Timeout | null = null;
	let body_input: HTMLTextAreaElement | null = $state(null);
	let ai_input: HTMLTextAreaElement | null = $state(null);
	let width = $state(0);
	let isMobile = $derived(width < 768);
	let showModal = $state(false);

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
		if (e.ctrlKey && e.key === 'Enter' && !loading) {
			const activeEl = document.activeElement;
			if (activeEl === body_input) {
				e.preventDefault();
				immediateSave();
			} else if (activeEl === ai_input) {
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
				console.debug('edg', res.data)
				post.t = res.data.t || post.t;
				post.b = res.data.b || post.b;
				instructions = '';
				saveWithDelay(post.b || '');
			} else {
				throw new Error('No response data');
			}
		} catch (e: any) {
			console.error('AI edit failed:', e);
			toast.error(e.response?.data?.message || 'Failed to update post with AI');
		} finally {
			loading = false;
		}
	}

	const immediateSave = async () => {
		if (!post.t && !post.b) return;
		
		saving = true;
		try {
			const formData = new FormData();
			formData.append('t', post.t || '');
			formData.append('b', post.b || '');
			
			const res = await axios.put(`/posts/${post.i}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});
			
			if (res.status === 200) {
				toast.success('Post saved');
			}
		} catch (e) {
			console.error('Save failed:', e);
			toast.error('Failed to save post');
		} finally {
			saving = false;
		}
	};

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

<svelte:window on:keydown={handleKeyDown} bind:innerWidth={width} />

<div class="mx-auto max-w-7xl p-4">
	<div class="flex gap-4">
		<div class="flex-1">
			<div class="mb-4 flex items-center justify-between">
				<h1 class="text-2xl font-bold text-purple-600">Edit Post</h1>
				<div class="flex items-center gap-2">
					{#if saving}
						<span class="text-sm text-purple-500">Saving...</span>
					{/if}
					<a href={`/posts/${post.i}`} class="btn-outline">View Post</a>
					<Button text="Delete" onclick={deletePost} />
				</div>
			</div>
			<div class="space-y-6">
				<div class="space-y-2">
					<DescriptionInput
						bind:value={post.t}
						placeholder="Enter post title"
						label="Title"
						editable={true}
					/>
				</div>
				<div class="space-y-2">
					<DescriptionInput
						bind:value={post.b}
						placeholder="Update your post content..."
						rows={10}
						bind:ref={body_input}
						label="Post Content"
						editable={true}
					/>
				</div>
				<div class="space-y-2">
					<DescriptionInput
						bind:value={instructions}
						placeholder="e.g., Add more details, make it shorter, improve language..."
						rows={4}
						bind:ref={ai_input}
						label="AI Edit Instructions"
						editable={true}
						send={editWithGemini}
						send_loading={loading}
					/>
				</div>
				{#if isMobile}
					<div class="space-y-2">
						<Button
							text="Show Preview"
							onclick={() => (showModal = true)}
						/>
					</div>
				{/if}
			</div>
		</div>
		{#if !isMobile}
			<div class="hidden md:block w-1/2 p-4">
				<div class="sticky top-4 rounded-lg border p-4">
					<h2 class="mb-2 text-xl font-semibold">Preview</h2>
					<h1 class="mb-4 text-2xl font-bold">{post.t || 'Untitled'}</h1>
					{@html md(post.b || '')}
				</div>
			</div>
		{/if}
	</div>
</div>

{#if isMobile && showModal}
	<Modal bind:open={showModal}>
		<div class="p-4">
			<h2 class="mb-2 text-xl font-semibold">Preview</h2>
			<h1 class="mb-4 text-2xl font-bold">{post.t || 'Untitled'}</h1>
			{@html md(post.b || '')}
		</div>
	</Modal>
{/if}
