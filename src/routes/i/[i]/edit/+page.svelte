<script lang="ts">
	import { toast } from '$lib/util/toast.svelte';
	import { onMount } from 'svelte';
	import {
		animate,
		createTimeline,
		stagger
	} from 'animejs';
	import Button from '$lib/components/Button.svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	let item = $state(page.data.i)
	let files: FileList | null = $state(null);
	let isSubmitting = $state(false);
	let currentImages = $state(item.x || []);

	function removeImage(url: string) {
		currentImages = currentImages.filter((img: string) => img !== url);
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

	async function upload_files(): Promise<string[]> {
		if (!files || files.length === 0) return [];
		const fd = new FormData();
		Array.from(files).forEach((f) =>
			fd.append('files', f)
		);
		const res = await fetch('/i/upload', {
			method: 'POST',
			body: fd
		});
		if (!res.ok) return [];
		const { x } = (await res.json()) as {
			x: string[];
		};
		return x || [];
	}

	async function submit() {
		try {
			isSubmitting = true;
			const formData = new FormData();
			formData.append('t', item.name);
			if (item.desc) formData.append('a', item.desc);
			formData.append('k', item.kind?.toString());
			formData.append('v', item.price?.toString());
			formData.append('m', item.currency);
			formData.append('keep_x', JSON.stringify(currentImages));
			if (files) {
				Array.from(files).forEach((f) =>
					formData.append('files', f)
				);
			}

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
		if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
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
							onchange={(e) =>
								(files = (
									e.target as HTMLInputElement
								).files)}
						/>
						<div
							class="rounded-2xl border-t-0 border-r-0 border border-dashed rounded-t-none p-8 text-center transition-all"
							style="border-color: var(--color-theme-3); background: transparent;"
						>
							<div class="mb-4">
								<i class="fas fa-camera text-4xl"></i>
							</div>
							<p
								class="text-lg font-medium"
								style="color: var(--color-theme-4);"
							>
								{files && files.length > 0
									? `${files.length} file(s) selected`
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
					<div id="current-images" role="region" aria-label="Current Images">
					{#if currentImages.length > 0}
					<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
						{#each currentImages as img (img)}
						<div class="relative">
							<img
								src={img}
								alt="item"
								class="w-full h-32 object-cover rounded-lg"
							/>
							<button
								onclick={() => removeImage(img)}
								class="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition-all"
								title="Remove image"
							>
								×
							</button>
						</div>
						{/each}
					</div>
					{:else}
					<p class="text-gray-500 text-sm">No images currently</p>
					{/if}
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
