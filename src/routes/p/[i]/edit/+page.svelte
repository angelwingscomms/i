<script lang="ts">
	import { marked } from 'marked';
	import type { Post, LocalsUser } from '$lib/types';
	import { toast } from '$lib/util/toast';
	import Button from '$lib/components/Button.svelte';

	let { post, user }: { post: Post; user: LocalsUser } = $props();
	let m = $state(post.m || '');
	let b = $state(post.b || '');
	let file = $state<File | null>(null);
	let image_url = $state(post.p || '');
	let remove_image = $state(false);
	let preview = $state(marked(b));
	let uploading = $state(false);

	function updatePreview() {
		preview = marked(b);
	}

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			file = target.files[0];
			const reader = new FileReader();
			reader.onload = (e) => {
				image_url = e.target?.result as string;
			};
			reader.readAsDataURL(file);
			remove_image = false;
		}
	}

	async function save() {
		if (!user) return;
		uploading = true;
		const formData = new FormData();
		formData.append('m', m);
		formData.append('b', b);
		if (file) formData.append('file', file);
		if (remove_image) formData.append('remove_image', 'true');

		try {
			const response = await fetch(`/p/${post.i}`, {
				method: 'PUT',
				body: formData
			});
			if (response.ok) {
				toast.success('Post updated successfully');
				window.location.href = `/p/${post.i}`;
			} else {
				toast.error('Failed to update post');
			}
		} catch (e) {
			toast.error('Error updating post');
		}
		uploading = false;
	}

	$effect(() => {
		if (b) updatePreview();
	});
</script>

<svelte:head>
	<title>Edit Post - {post.m}</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<div class="mb-8">
			<a href="/p" class="text-purple-600 hover:underline mb-4 inline-block">&larr; Back to Posts</a>
			<h1 class="text-3xl font-bold text-gray-900">Edit Post</h1>
		</div>

		<form on:submit|preventDefault={save} class="space-y-6">
			<div>
				<label for="title" class="block text-sm font-medium text-gray-700 mb-2">Title</label>
				<input
					id="title"
					type="text"
					bind:value={m}
					class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
					required
				/>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2">Image</label>
				{#if image_url}
					<div class="mb-4">
						<img src={image_url} alt="Current image" class="w-32 h-32 object-cover rounded-lg" />
						<button type="button" on:click={() => (remove_image = true, image_url = '', file = null)} class="ml-4 text-red-600 hover:underline">Remove</button>
					</div>
				{/if}
				{#if remove_image}
					<p class="text-gray-500 text-sm">Image removed</p>
				{:else}
					<input type="file" on:change={handleFileChange} accept="image/*" class="w-full rounded-lg border border-gray-300 px-4 py-2" />
				{/if}
			</div>

			<div>
				<label for="body" class="block text-sm font-medium text-gray-700 mb-2">Body</label>
				<textarea
					id="body"
					bind:value={b}
					rows="10"
					class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
					placeholder="Write your post in markdown..."
				></textarea>
				<div class="mt-4 prose max-w-none">{@html preview}</div>
			</div>

			<Button  text={uploading ? 'Saving...' : 'Save Post'} disabled={uploading} onClick={save} />
		</form>
	</div>
</div>