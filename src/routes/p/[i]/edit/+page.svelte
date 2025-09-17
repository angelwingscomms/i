<script lang="ts">
	import type { Post, LocalsUser } from '$lib/types';
	import { toast } from '$lib/util/toast';
	import Button from '$lib/components/Button.svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';

	let { data } = $props();
	let post = data.p;
	let t = $state(post.t || '');
	let b = $state(post.b || '');
	let file = $state<File | null>(null);
	let image_url = $state(post.p || '');
	let r = $state(false);
	let uploading = $state(false);

	function handleFileChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			file = target.files[0];
			const reader = new FileReader();
			reader.onload = (e) => {
				image_url = e.target?.result as string;
			};
			reader.readAsDataURL(file);
			r = false;
		}
	}

	async function save() {
		uploading = true;
		const formData = new FormData();
		formData.append('t', t);
		formData.append('b', b);
		if (file) formData.append('file', file);
		if (r) formData.append('r', 'true');

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
</script>

<svelte:head>
	<title>Edit Post - {post.t}</title>
</svelte:head>

<div
	class="min-h-screen bg-gray-50 py-8 dark:bg-gray-900"
>
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<div class="mb-8">
			<a
				href="/p"
				class="mb-4 inline-block text-purple-600 hover:underline dark:text-purple-400"
				>&larr; Back to Posts</a
			>
			<h1
				class="text-3xl font-bold text-gray-900 dark:text-white"
			>
				Edit Post
			</h1>
		</div>

		<form
			on:submit|preventDefault={save}
			class="space-y-6"
		>
			<div>
				<label
					for="title"
					class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Title</label
				>
				<input
					id="title"
					type="text"
					bind:value={t}
					class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400"
					required
				/>
			</div>

			<div>
				<label
					class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
					>Image</label
				>
				{#if image_url}
					<div class="mb-4">
						<img
							src={image_url}
							alt="Current image"
							class="h-32 w-32 rounded-lg object-cover"
						/>
						<button
							type="button"
							on:click={() => (
								(r = true),
								(image_url = ''),
								(file = null)
							)}
							class="ml-4 text-red-600 hover:underline dark:text-red-400"
							>Remove</button
						>
					</div>
				{/if}
				<input
					type="file"
					on:change={handleFileChange}
					accept="image/*"
					class="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-purple-400 dark:focus:ring-purple-400"
				/>
			</div>

			<DescriptionInput
				label="Body"
				bind:value={b}
				placeholder="Write your post in markdown..."
			/>

			<Button
				text={uploading ? 'Saving...' : 'Save Post'}
				disabled={uploading}
				onClick={save}
			/>
		</form>
	</div>
</div>
