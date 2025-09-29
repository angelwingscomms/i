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
	import Combo from '$lib/components/Combo.svelte';
	import axios from 'axios';
	import ZoneSearch from '$lib/components/ZoneSearch.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import type { Item } from '$lib/types/item';
	import type { Zone } from '$lib/types/zone';

	let init: Item = page.data.i, // should not change
		item: Item = $state(page.data.i),
		selectedFiles = $state<File[]>([]),
		previewUrls = $state<string[]>([]),
		saving = $state(false),
		hidden: boolean = $state(!!item.h),
		images_to_remove: string[] = $state([]),
		currentZones: Zone[] = $state(item.z || []),
		newZones: Zone[] = $state([]),
		zonesToRemove: string[] = $state([]);

	console.log(item, 'item');

	let currencies = $state([
		{ value: '₦', label: 'Naira (₦)' },
		{ value: '₵', label: 'Cedi (₵)' },
		{ value: '$', label: 'US Dollar ($)' }
	]);

	// if (!item.a) item.a = ''

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
		previewUrls.forEach((url) =>
			URL.revokeObjectURL(url)
		);
	});

	const save = async () => {
		try {
			saving = true;
			const formData = new FormData();
			formData.append('n', item.n);
			if (item.a) formData.append('a', item.a);
			formData.append(
				'k',
				item.k ? item.k.toString() : '0'
			);
			if (item.p)
				formData.append('p', item.p.toString());
			formData.append('p', item.p ? '.' : '');
			formData.append('m', item.c);
			formData.append(
				'rx',
				JSON.stringify(images_to_remove)
			);
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

			if (zonesToRemove.length > 0) {
				formData.append(
					'zr',
					JSON.stringify(zonesToRemove)
				);
			}
			if (newZones.length > 0) {
				formData.append(
					'z',
					JSON.stringify(newZones.map((z) => z.i))
				);
			}
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
		} catch (error) {
			console.error(error);
			toast.error('failed to update item');
		} finally {
			saving = false;
		}
	};

	const deleteItem = async () => {
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
	};
</script>

<div
	class="from-bg-primary via-bg-secondary to-bg-tertiary min-h-screen bg-gradient-to-br"
>
	<!-- Page Header -->
	<div
		class="page-header relative z-10 px-4 py-16 text-center opacity-0 sm:py-12"
	>
		<div class="mx-auto max-w-4xl">
			<h1
				class="mb-6 text-6xl font-black text-[var(--color-theme-4)] sm:text-4xl"
			>
				Edit Your <span
					class="text-[var(--color-theme-1)]"
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
			class="rounded-3xl border border-[var(--color-theme-3)] bg-transparent p-8 sm:p-6"
		>
			<div class="space-y-8">
				<!-- Name Field -->
				<div class="form-field opacity-0">
					<DescriptionInput
						bind:value={item.n}
						placeholder="Enter a catchy name for your item..."
						label="Item Name"
					/>
				</div>

				<!-- Description Field -->
				<div class="form-field opacity-0">
					<DescriptionInput
						bind:value={item.a}
						placeholder="Describe your item in detail. What makes it special?"
						rows={5}
						label="Description"
					/>
				</div>

				<!-- Type Selection -->
				<div class="form-field opacity-0">
					<label
						for="item-type"
						class="mb-3 block text-lg font-bold text-[var(--color-theme-4)]"
					>
						<span class="text-[var(--color-theme-1)]"
							>*</span
						> Type
					</label>
					<div class="flex gap-4">
						<Button
							text="Product"
							icon="fa-shopping-bag"
							onclick={() => (item.k = 0)}
							active={item.k === 0}
						/>
						<Button
							text="Service"
							icon="fa-wrench"
							onclick={() => (item.k = 1)}
							active={item.k === 1}
						/>
					</div>
				</div>

				Private Checkbox
				<div class="form-field opacity-0">
					<label
						class="flex cursor-pointer items-center space-x-2"
					>
						<input
							type="checkbox"
							bind:checked={hidden}
							class="h-4 w-4 rounded border-gray-300 accent-[var(--color-theme-1)] focus:ring-[var(--color-theme-1)]"
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
						class="mb-3 block text-lg font-bold text-[var(--color-theme-4)]"
					>
						<span class="text-[var(--color-theme-1)]"
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
								bind:value={item.p}
							/>
						</div>
						<div class="w-24">
							<Combo
								items={currencies}
								bind:value={item.c}
								placeholder="₦"
							/>
						</div>
					</div>
				</div>

				<!-- File Upload -->
				<div class="form-field opacity-0">
					<label
						for="file-upload"
						class="mb-3 block text-lg font-bold text-[var(--color-theme-4)]"
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
								const input =
									e.target as HTMLInputElement;
								const inputFiles = input.files;
								if (inputFiles) {
									// Clear previous previews
									previewUrls.forEach(
										URL.revokeObjectURL
									);
									previewUrls = [];
									selectedFiles =
										Array.from(inputFiles);
									// Generate new previews
									selectedFiles.forEach((file) => {
										const url =
											URL.createObjectURL(file);
										previewUrls.push(url);
									});
									// Reset input to allow re-selecting same files
									input.value = '';
								}
							}}
						/>
						<div
							class="rounded-2xl border border-[var(--color-theme-3)] bg-transparent p-8 text-center transition-all"
						>
							<div class="mb-4">
								<i
									class="fas fa-camera text-4xl text-[var(--color-theme-4)]"
								></i>
							</div>
							<p
								class="text-lg font-medium text-[var(--color-theme-4)]"
							>
								{selectedFiles.length > 0
									? `${selectedFiles.length} file(s) selected`
									: 'Click to upload new images'}
							</p>
							<p
								class="mt-2 text-sm text-[var(--color-theme-3)]"
							>
								PNG, JPG, GIF up to 10MB each
							</p>
						</div>
					</div>

					<!-- New Images Preview -->
					{#if previewUrls.length > 0}
						<div class="mt-6">
							<label
								for="preview-images"
								class="mb-3 block text-lg font-bold text-[var(--color-theme-4)]"
							>
								New Images Preview
							</label>
							<div
								class="grid grid-cols-2 gap-4 md:grid-cols-3"
							>
								{#each previewUrls as url, index (url)}
									<div class="relative">
										<img
											src={url}
											alt="preview"
											class="h-32 w-full rounded-lg object-cover"
										/>
										<button
											onclick={() =>
												removePreview(index)}
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
						class="mb-3 block text-lg font-bold text-[var(--color-theme-4)]"
					>
						Current Images
					</label>
					<div
						id="current-images"
						role="region"
						aria-label="Current Images"
					>
						{#if item.x && item.x.length > 0}
							<div
								class="grid grid-cols-2 gap-4 md:grid-cols-3"
							>
								{#each item.x as img (img)}
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

					<!-- Current Zones -->
					<div class="form-field opacity-0">
						<div
							class="mb-3 block text-lg font-bold text-[var(--color-theme-4)]"
						>
							Current Zones
						</div>
						{#if currentZones.length > 0}
							<div
								class="grid grid-cols-2 gap-4 md:grid-cols-3"
							>
								{#each currentZones as z (z.i)}
									<div
										class="relative rounded-lg border p-4"
									>
										<span class="block text-sm"
											>{z.n}</span
										>
										<button
											onclick={() => {
												zonesToRemove.push(z.i);
												currentZones =
													currentZones.filter(
														(zz) => zz.i !== z.i
													);
											}}
											class="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white transition-all hover:bg-red-600"
											title="Remove zone"
										>
											×
										</button>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-gray-500">
								No current zones
							</p>
						{/if}
					</div>
					p
					<!-- New Zones -->
					<div class="form-field opacity-0">
						<div
							class="mb-3 block text-lg font-bold text-[var(--color-theme-4)]"
						>
							New Zones
						</div>
						{#if newZones.length > 0}
							<div
								class="grid grid-cols-2 gap-4 md:grid-cols-3"
							>
								{#each newZones as z (z.i)}
									<div
										class="relative rounded-lg border p-4"
									>
										<span class="block text-sm"
											>{z.n}</span
										>
										<button
											onclick={() => {
												newZones = newZones.filter(
													(zz) => zz.i !== z.i
												);
											}}
											class="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white transition-all hover:bg-red-600"
											title="Remove new zone"
										>
											×
										</button>
									</div>
								{/each}
							</div>
						{/if}
					</div>

					<!-- Zone Search -->
					<div class="form-field opacity-0">
						<div class="space-y-2">
							<h2
								class="text-lg font-semibold text-[var(--color-theme-4)]"
							>
								Add New Zones
							</h2>
							<ZoneSearch
								onSelect={(z) => {
									if (
										!newZones.some(
											(zz) => zz.i === z.i
										)
									) {
										newZones.push(z);
									}
								}}
							/>
						</div>
					</div>
				</div>

				<div class="space-y-0 pt-4">
					<!-- Submit Button -->
					<div class="form-field opacity-0">
						<Button
							text={saving
								? 'Updating...'
								: 'Update Item'}
							icon={saving
								? 'fa-spinner fa-spin'
								: 'fa-save'}
							onclick={save}
							disabled={saving}
						/>
					</div>

					<!-- View Item Button -->
					<div class="form-field opacity-0">
						<Button
							text="view item"
							icon="fa-eye"
							onclick={() => goto(`/i/${item.i}`)}
						/>
					</div>

					<!-- Delete Button -->
					<div class="form-field opacity-0">
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
</div>
