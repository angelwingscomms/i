<script lang="ts">
	import { toast } from '$lib/util/toast.svelte';
	import { onMount, onDestroy } from 'svelte';
	import {
		animate,
		createTimeline,
		stagger
	} from 'animejs';
	import Button from '$lib/components/Button.svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import axios from 'axios';
	import ZoneSearch from '$lib/components/ZoneSearch.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let init = page.data.i; // should not change
	let item = $state(page.data.i);
	let selectedFiles = $state<File[]>([]);
	let previewUrls = $state<string[]>([]);
	let isSubmitting = $state(false);
	let currentImages = $state(item.x || []);
	let isPrivate = $state(item.p === '.');

	function removeImage(url: string) {
		currentImages = currentImages.filter(
			(img: string) => img !== url
		);
	}

	function removePreview(index: number) {
		URL.revokeObjectURL(previewUrls[index]);
		previewUrls = previewUrls.filter((_, i) => i !== index);
		selectedFiles = selectedFiles.filter((_, i) => i !== index);
	}

	onMount(() => {
		// Page entrance animations
		const timeline = createTimeline()
			.add('.page-header', {
				opacity: [0, 1],
				translateY: [50, 0],
				duration: 800
			})
			.add(
				'.form-section',
				{
					opacity: [0, 1],
					translateY: [30, 0],
					duration: 600
				},
				'-=400'
			)
			.add(
				'.form-field',
				{
					opacity: [0, 1],
					translateY: [20, 0],
					duration: 400,
					delay: stagger(100)
				},
				'-=200'
			);

		// Interactive hover animations
		document.addEventListener('mouseover', (e) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('form-field')) {
				animate(target, {
					scale: 1.02,
					duration: 200,
					ease: 'outQuart'
				});
			}
		});

		document.addEventListener('mouseout', (e) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('form-field')) {
				animate(target, {
					scale: 1,
					duration: 200,
					ease: 'outQuart'
				});
			}
		});
	});

	onDestroy(() => {
		previewUrls.forEach(url => URL.revokeObjectURL(url));
	});

	async function submit() {
		try {
			isSubmitting = true;
			const formData = new FormData();
			formData.append('t', item.name);
			if (item.desc) formData.append('a', item.desc);
			formData.append('k', item.kind?.toString());
			formData.append('v', item.price?.toString());
			formData.append('p', isPrivate ? '.' : '');
			formData.append('m', item.currency);
			const originalImages = init.x || [];
			const rx = originalImages.filter((img: string) => !currentImages.includes(img));
			formData.append('rx', JSON.stringify(rx));
			if (selectedFiles.length > 0) {
				selectedFiles.forEach((f) => {
					formData.append('f', f);
					console.log(
						'Frontend: Appending file:',
						f.name,
						f.size,
						f.type
					);
				});
				console.log(
					'Frontend: Files selected for upload:',
					selectedFiles.length
				);
			} else {
				console.log('Frontend: No files selected');
			}

			if (item.z !== init.z)
				formData.append('z', JSON.stringify(item.z));
			console.log(
				'Frontend: Sending POST to /i/${item.i}/edit with FormData entries:',
				Array.from(formData.entries()).map(
					([k, v]) => ({
						k,
						v:
							v instanceof File
								? `${v.name} (${v.size}B)`
								: v
					})
				)
			);
			const res = await axios.post(
				`/i/${item.i}/edit`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				}
			);
			if (res.status !== 200)
				throw new Error('update failed');

			// Success animation
			animate('.form-section', {
				scale: [1, 1.02, 1],
				duration: 500,
				ease: 'outElastic(1, .8)'
			});

			toast.success('item updated');
			goto(`/i/${item.i}`);
		} catch (error) {
			console.error(error);
			toast.error('failed to update item');
		} finally {
			isSubmitting = false;
		}
	}

	async function deleteItem() {
		if (
			!confirm(
				'Are you sure you want to delete this item? This action cannot be undone.'
			)
		)
			return;
		try {
			await axios.delete(`/i/${item.i}/edit`);
			toast.success('item deleted');
			goto('/find');
		} catch (error) {
			console.error(error);
			toast.error('failed to delete item');
		}
	}
</script>

<div
	class="from-bg-primary via-bg-secondary to-bg-tertiary min-h-screen bg-gradient-to-br"
>
	<!-- Floating background elements -->
	<div class="absolute inset-0 overflow-hidden">
		<div
			class="floating-orb absolute -top-20 -left-20 h-64 w-64 rounded-full opacity-20"
			style="background: var(--color-theme-1);"
		></div>
		<div
			class="floating-orb absolute -right-20 -bottom-20 h-80 w-80 rounded-full opacity-15"
			style="background: var(--color-theme-3);"
		></div>
		<div
			class="floating-orb absolute top-1/4 right-1/4 h-32 w-32 rounded-full opacity-10"
			style="background: var(--color-theme-3);"
		></div>
	</div>

	<!-- Page Header -->
	<div
		class="page-header relative z-10 px-4 py-16 text-center opacity-0 sm:py-12"
	>
		<div class="mx-auto max-w-4xl">
			<h1
				class="mb-6 text-6xl font-black sm:text-4xl"
				style="color: var(--color-theme-4);"
			>
				Edit Your <span
					style="color: var(--color-theme-1);"
					>Listing</span
				>
			</h1>
			<p
				class="text-xl text-gray-600 sm:text-lg dark:text-gray-300"
			>
				Update your product or service details
			</p>
		</div>
	</div>

	<!-- Form Section -->
	<div
		class="form-section relative z-10 mx-auto max-w-2xl px-4 pb-16 opacity-0"
	>
		<div
			class="rounded-3xl p-8 sm:p-6"
			style="background: transparent; border: 1px solid var(--color-theme-3);"
		>
			<div class="space-y-8">
				<!-- Name Field -->
				<div class="form-field opacity-0">
					<DescriptionInput
						bind:value={item.name}
						placeholder="Enter a catchy name for your item..."
						label="Item Name"
						editable={true}
					/>
				</div>

				<!-- Description Field -->
				<div class="form-field opacity-0">
					<DescriptionInput
						bind:value={item.desc}
						placeholder="Describe your item in detail. What makes it special?"
						rows={5}
						label="Description"
						editable={true}
					/>
				</div>

				<!-- Type Selection -->
				<div class="form-field opacity-0">
					<label
						for="item-type"
						class="mb-3 block text-lg font-bold"
						style="color: var(--color-theme-4);"
					>
						<span style="color: var(--color-theme-1);"
							>*</span
						> Type
					</label>
					<div class="flex gap-4">
						<Button
							text="Product"
							icon="fa-shopping-bag"
							onclick={() => (item.kind = 0)}
							active={item.kind === 0}
						/>
						<Button
							text="Service"
							icon="fa-wrench"
							onclick={() => (item.kind = 1)}
							active={item.kind === 1}
						/>
					</div>
				</div>

				<!-- Private Checkbox -->
				<div class="form-field opacity-0">
					<label
						class="flex cursor-pointer items-center space-x-2"
					>
						<input
							type="checkbox"
							bind:checked={isPrivate}
							class="text-theme-1 focus:ring-theme-1 h-4 w-4 rounded border-gray-300"
						/>
						<span
							class="text-sm font-medium text-gray-700 dark:text-gray-300"
							>make private</span
						>
					</label>
					<p
						class="mt-1 text-xs text-gray-500 dark:text-gray-400"
					>
						only you can see this post
					</p>
				</div>

				<!-- Price and Currency Fields -->
				<div class="form-field opacity-0">
					<label
						for="item-price"
						class="mb-3 block text-lg font-bold"
						style="color: var(--color-theme-4);"
					>
						<span style="color: var(--color-theme-1);"
							>*</span
						> Price
					</label>
					<div class="flex gap-4">
						<div class="relative flex-1">
							<DescriptionInput
								type="number"
								min="0"
								voice_typing={false}
								step="0.01"
								placeholder="0.00"
								bind:value={item.price}
							/>
						</div>
						<div class="w-/12">
							<DescriptionInput
								placeholder="currency"
								bind:value={item.currency}
							/>
						</div>
					</div>
				</div>

				<!-- File Upload -->
				<div class="form-field opacity-0">
					<label
						for="file-upload"
						class="mb-3 block text-lg font-bold"
						style="color: var(--color-theme-4);"
					>
						Add new images (optional)
					</label>
					<div class="relative">
						<input
							id="file-upload"
							type="file"
							multiple
							accept="image/*"
							class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
							onchange={(e) => {
								const input = e.target as HTMLInputElement;
								const inputFiles = input.files;
								if (inputFiles) {
									// Clear previous previews
									previewUrls.forEach(URL.revokeObjectURL);
									previewUrls = [];
									selectedFiles = Array.from(inputFiles);
									// Generate new previews
									selectedFiles.forEach(file => {
										const url = URL.createObjectURL(file);
										previewUrls.push(url);
									});
									// Reset input to allow re-selecting same files
									input.value = '';
								}
							}}
						/>
						<div
							class="rounded-2xl rounded-t-none border border-t-0 border-r-0 border-b-0 rounded-b-none border-none p-8 text-center transition-all"
							style="border-color: var(--color-theme-3); background: transparent;"
						>
							<div class="mb-4">
								<i class="fas fa-camera text-4xl"></i>
							</div>
							<p
								class="text-lg font-medium"
								style="color: var(--color-theme-4);"
							>
								{selectedFiles.length > 0
									? `${selectedFiles.length} file(s) selected`
									: 'Click to upload new images'}
							</p>
							<p
								class="mt-2 text-sm"
								style="color: var(--color-theme-3);"
							>
								PNG, JPG, GIF up to 10MB each
							</p>
						</div>
					</div>

					<!-- New Images Preview -->
					{#if previewUrls.length > 0}
						<div class="mt-6">
							<label class="mb-3 block text-lg font-bold" style="color: var(--color-theme-4);">
								New Images Preview
							</label>
							<div class="grid grid-cols-2 gap-4 md:grid-cols-3">
								{#each previewUrls as url, index (url)}
									<div class="relative">
										<img
											src={url}
											alt="preview"
											class="h-32 w-full rounded-lg object-cover"
										/>
										<button
											onclick={() => removePreview(index)}
											class="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white transition-all hover:bg-red-600"
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

				<!-- Current Images -->
				<div class="form-field opacity-0">
					<label
						for="current-images"
						class="mb-3 block text-lg font-bold"
						style="color: var(--color-theme-4);"
					>
						Current Images
					</label>
					<div
						id="current-images"
						role="region"
						aria-label="Current Images"
					>
						{#if currentImages.length > 0}
							<div
								class="grid grid-cols-2 gap-4 md:grid-cols-3"
							>
								{#each currentImages as img (img)}
									<div class="relative">
										<img
											src={img}
											alt="item"
											class="h-32 w-full rounded-lg object-cover"
										/>
										<button
											onclick={() => removeImage(img)}
											class="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white transition-all hover:bg-red-600"
											title="Remove image"
										>
											×
										</button>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-gray-500">
								No images currently
							</p>
						{/if}
					</div>

					<div class="form-field opacity-0">
						<div class="space-y-2">
							<h2 class="text-lg font-semibold">
								assign zones
							</h2>
							{#if item.z && item.z.length > 0}
								<div
									class="text-sm text-[var(--muted)]"
								>
									current zones:
									{#each item.z as z}
										<div>{z.n}</div>
									{/each}
								</div>
							{/if}
							<ZoneSearch
								onSelect={(z) => {
									if (!item.z.includes(z.i))
										item.z.push(z.i);
									submit();
								}}
							/>
						</div>
					</div>
				</div>

				<!-- Submit Button -->
				<div class="form-field pt-4 opacity-0">
					<Button
						text={isSubmitting
							? 'Updating...'
							: 'Update Item'}
						icon={isSubmitting
							? 'fa-spinner fa-spin'
							: 'fa-save'}
						onclick={submit}
						disabled={isSubmitting}
					/>
				</div>

				<!-- Delete Button -->
				<div class="form-field pt-4 opacity-0">
					<Button
						text="Delete Item"
						icon="fa-trash"
						onclick={deleteItem}
					/>
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Custom Styles -->
<style>
	.floating-orb {
		filter: blur(40px);
		animation: float 8s ease-in-out infinite;
	}

	.floating-orb:nth-child(2) {
		animation-delay: -2s;
	}

	.floating-orb:nth-child(3) {
		animation-delay: -4s;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-30px) rotate(180deg);
		}
	}

	.page-header,
	.form-section,
	.form-field {
		opacity: 0;
	}

	:global(.active) {
		background: var(--color-theme-1);
		color: white;
	}
</style>
