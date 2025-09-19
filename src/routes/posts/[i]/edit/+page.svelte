&lt;script lang="ts"&gt;
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import { toast } from '$lib/util/toast';
	import axios from 'axios';
	import {md} from '$lib/util/marked';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let post = $state(data.p);
	let instructions = $state('');
	let loading = $state(false);
	let showPreview = $state(false);
	let saving = $state(false);
	let timeout: NodeJS.Timeout | null = null;
	let ai_input: HTMLTextAreaElement | null =
		$state(null);

	const saveWithDelay = (body: string) =&gt; {
		saving = true;
		if (timeout) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(async () =&gt; {
			try {
				const formData = new FormData();
				formData.append('t', post.t || '');
				formData.append('b', body);
				const res = await axios.put(
					`/posts/${post.i}`,
					formData,
					{
						headers: {
							'Content-Type': 'multipart/form-data'
						}
					}
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

	$effect(() =&gt; {
		if (post.b) {
			saveWithDelay(post.b);
		}
	});

	$effect(() =&gt; {
		if (post.t !== undefined) {
			saveWithDelay(post.b || '');
		}
	});

	const handleKeyDown = (e: KeyboardEvent) =&gt; {
		if (e.ctrlKey &amp;&amp; e.key === 'Enter' &amp;&amp; !loading) {
			const activeEl = document.activeElement;
			if (activeEl &amp;&amp; activeEl === ai_input) {
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

	async function deletePost() {
		if (
			!confirm(
				'Are you sure you want to delete this post?'
			)
		)
			return;
		try {
			await axios.delete(`/posts/${post.i}`);
			toast.success('Post deleted');
			goto('/posts');
		} catch (e) {
			toast.error('Failed to delete post');
		}
	}
&lt;/script&gt;

&lt;svelte:window on:keydown={handleKeyDown} /&gt;

&lt;div class="mx-auto max-w-2xl p-4"&gt;
	&lt;div class="mb-4 flex items-center justify-between"&gt;
		&lt;h1 class="text-2xl font-bold"&gt;Edit Post&lt;/h1&gt;
		&lt;div class="flex items-center gap-2"&gt;
			{#if saving}
				&lt;span class="text-sm text-gray-500"
					&gt;Saving...&lt;/span
				&gt;
			{/if}
			&lt;a href={`/posts/${post.i}`} class="btn-outline"
				&gt;View Post&lt;/a
			&gt;
			&lt;Button text="Delete" onclick={deletePost} /&gt;
		&lt;/div&gt;
	&lt;/div&gt;
	&lt;div class="space-y-6"&gt;
		&lt;div class="space-y-2"&gt;
			&lt;label for="title" class="block text-sm font-medium text-gray-700"&gt;Title&lt;/label&gt;
			&lt;input
				id="title"
				type="text"
				bind:value={post.t}
				placeholder="Enter post title"
				class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
			/&gt;
		&lt;/div&gt;
		&lt;div class="space-y-2"&gt;
			&lt;DescriptionInput
				bind:value={post.b}
				placeholder="Update your post content..."
				rows={10}
				bind:ref={ai_input}
				label="Post Content"
				editable={true}
				send_button={false}
			/&gt;
		&lt;/div&gt;
		&lt;div class="space-y-2"&gt;
			&lt;DescriptionInput
				bind:value={instructions}
				placeholder="e.g., Add more details, make it shorter, improve language..."
				rows={4}
				label="AI Edit Instructions"
				editable={true}
			/&gt;
			&lt;Button
				text={loading
					? 'Updating...'
					: 'Update with AI'}
				onclick={editWithGemini}
				{loading}
				disabled={loading || !instructions.trim()}
			/&gt;
		&lt;/div&gt;
		&lt;div class="space-y-2"&gt;
			&lt;Button
				text={showPreview
					? 'hide preview'
					: 'show preview'}
				onclick={() =&gt; (showPreview = !showPreview)}
			/&gt;
			{#if showPreview}
				&lt;div class="mt-4 rounded-lg p-4"&gt;
					&lt;h2 class="mb-2 text-xl font-semibold"&gt;
						Preview
					&lt;/h2&gt;
					&lt;h1 class="mb-4 text-2xl font-bold"&gt;{post.t || 'Untitled'}&lt;/h1&gt;
					{@html md(post.b || '')}
				&lt;/div&gt;
			{/if}
		&lt;/div&gt;
	&lt;/div&gt;
&lt;/div&gt;
