<script lang="ts">
	import { page } from '$app/state';
	import axios from 'axios';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import type { Item, User } from '$lib/types';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';

	let {
		item,
		onclick,
		showDetails = false,
		loading = $bindable(false)
	} = $props<{
		item: Item;
		onclick: () => void;
		showDetails?: boolean;
		loading?: boolean;
	}>();

	let message = $state('');
	let items = $state<Item[]>([]);
	let inputEl: HTMLInputElement | null = null;
	let selectedFiles = $state<File[]>([]);
	let previewUrls = $state<string[]>([]);
	let images_to_remove: string[] = $state([]);

	$effect(() => {
		if (showDetails && items.length === 0) {
			load_related_items();
		}
	});

	const displayName = $derived.by(
		() => item.t || 'unnamed item'
	);

	const isOwner = $derived(
		page.data.user?.i === item.u
	);

	async function load_related_items() {
		try {
			const { data } = await axios.get(
				`/api/items/${item.i}/related`
			);
			items = data;
		} catch (e) {
			console.error(e.response?.data || e.message);
		}
	}

	function removeImage(url: string) {
		item.x = item.x?.filter(
			(img: string) => img !== url
		);
		images_to_remove.push(url);
	}

	function removePreview(index: number) {
		URL.revokeObjectURL(previewUrls[index]);
		previewUrls = previewUrls.filter(
			(_, i) => i !== index
		);
		selectedFiles = selectedFiles.filter(
			(_, i) => i !== index
		);
	}

	async function send_update() {
		loading = true;
		try {
			const formData = new FormData();
			formData.append('i', item.i);
			formData.append('t', item.t);
			formData.append('m', message);
			formData.append(
				'rx',
				JSON.stringify(images_to_remove)
			);
			selectedFiles.forEach((f) => {
				formData.append('f', f);
			});

			await axios.post('/api/update', formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});
			message = '';
			images_to_remove = [];
			selectedFiles = [];
			previewUrls.forEach(URL.revokeObjectURL);
			previewUrls = [];
			onclick();
		} catch (e) {
			console.error(e.response?.data || e.message);
		} finally {
			loading = false;
		}
	}

	function handle_keydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send_update();
		}
	}

	onMount(() => {
		inputEl?.focus();
	});
</script>

<div class="component-container">
	<div
		class="item-header flex items-center justify-between border-b p-4"
	>
		<h3 class="text-lg font-bold">{displayName}</h3>
		{#if isOwner}
			<Button
				onclick={send_update}
				{loading}
				text="update"
				icon="fa-save"
			/>
		{/if}
	</div>

	{#if showDetails}
		<div class="item-details p-4" in:fade>
			<p class="mb-4 text-gray-600">
				{item.d || 'no description'}
			</p>

			{#if items.length > 0}
				<div class="related-items mb-4">
					<h4 class="text-md mb-2 font-semibold">
						related items
					</h4>
					<div
						class="grid grid-cols-1 gap-2 md:grid-cols-2"
					>
						{#each items as related_item (related_item.i)}
							<div
								class="related-item rounded border p-2"
								in:fade
							>
								{related_item.t}
							</div>
						{/each}
					</div>
				</div>
			{/if}

			{#if isOwner}
				<div class="update-form">
					<DescriptionInput
						bind:value={message}
						placeholder="add a message..."
						rows={3}
						bind:ref={inputEl}
						onkeydown={handle_keydown}
					/>

					<!-- Current Images -->
					{#if item.x && item.x.length > 0}
						<div class="mt-4">
							<label
								class="mb-2 block text-sm font-medium"
								>Current Images</label
							>
							<div
								class="grid grid-cols-2 gap-2 md:grid-cols-3"
							>
								{#each item.x as img (img)}
									<div class="relative">
										<img
											src={img}
											alt="item"
											class="h-20 w-full rounded object-cover"
										/>
										<button
											onclick={() => removeImage(img)}
											class="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
											title="Remove image"
										>
											×
										</button>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Add New Images -->
					<div class="mt-4">
						<label
							for="file-upload"
							class="mb-2 block text-sm font-medium"
							>Add new images</label
						>
						<input
							id="file-upload"
							type="file"
							multiple
							accept="image/*"
							class="block w-full text-sm"
							onchange={(e) => {
								const input =
									e.target as HTMLInputElement;
								const files = input.files;
								if (files) {
									selectedFiles = Array.from(files);
									previewUrls = selectedFiles.map(
										(file) =>
											URL.createObjectURL(file)
									);
								}
							}}
						/>
					</div>

					<!-- New Image Previews -->
					{#if previewUrls.length > 0}
						<div class="mt-4">
							<label
								class="mb-2 block text-sm font-medium"
								>New Images Preview</label
							>
							<div
								class="grid grid-cols-2 gap-2 md:grid-cols-3"
							>
								{#each previewUrls as url, index (url)}
									<div class="relative">
										<img
											src={url}
											alt="preview"
											class="h-20 w-full rounded object-cover"
										/>
										<button
											onclick={() =>
												removePreview(index)}
											class="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white"
											title="Remove preview"
										>
											×
										</button>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
