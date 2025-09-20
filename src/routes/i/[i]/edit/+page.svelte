<script lang="ts">
	import { toast } from '$lib/util/toast';
	import { onMount } from 'svelte';
	import {
		animate,
		createTimeline,
		stagger
	} from 'animejs';
	import Button from '$lib/components/Button.svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import { goto } from '$app/navigation';
	import axios from 'axios';
	import type { PageProps } from './$types';
	import type { Item } from '$lib/types/item';

	let { data }: PageProps = $props();
	let { i: item }: { i: Item } = data;

	let name = $state(item.t);
	let desc = $state(item.a || '');
	let kind = $state(item.k ?? 0);
	let files: FileList | null = $state(null);
	let price = $state(item.v ?? 0);
	let currentImages = $state(item.x || []);
	let isSubmitting = $state(false);

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
			const new_x = await upload_files();
			const updated_x = [...currentImages, ...new_x];
			const res = await axios.post(`/i/${item.i}/edit`, {
				t: name,
				a: desc,
				k: kind,
				v: price,
				x: updated_x
			});
			if (res.status !== 200) throw new Error('update failed');

			// Success animation
			animate('.form-section', {
				scale: [1, 1.02, 1],
				duration: 500,
				ease: 'outElastic(1, .8)'
			});

			toast.success('item updated');
			goto(`/i/${item.i}`);
		} catch (error) {
			toast.error('failed to update item');
		} finally {
			isSubmitting = false;
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
					<label
						for="item-name"
						class="mb-3 block text-lg font-bold"
						style="color: var(--color-theme-4);"
					>
						Item Name
					</label>
					<input
						id="item-name"
						class="w-full rounded-full px-6 py-4 text-lg font-medium transition-all focus:outline-none"
						style="border: 1px solid var(--color-theme-3); background: transparent;"
						placeholder="Enter a catchy name for your item..."
						bind:value={name}
						onfocus={(e) =>
							((e.target as HTMLInputElement).style.border =
								'1px solid var(--color-theme-1)')}
						onblur={(e) =>
							((e.target as HTMLInputElement).style.border =
								'1px solid var(--color-theme-3)')}
					/>
				</div>

				<!-- Description Field -->
				<div class="form-field opacity-0">
					<DescriptionInput
						bind:value={desc}
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
							onclick={() => (kind = 0)}
							active={kind === 0}
						/>
						<Button
							text="Service"
							icon="fa-wrench"
							onclick={() => (kind = 1)}
							active={kind === 1}
						/>
					</div>
				</div>

				<!-- Price Field -->
				<div class="form-field opacity-0">
					<label
						for="item-price"
						class="mb-3 block text-lg font-bold"
						style="color: var(--color-theme-4);"
					>
						<span style="color: var(--color-theme-1);">*</span> Price
					</label>
					<div class="relative">
						<input
							id="item-price"
							type="number"
							min="0"
							step="0.01"
							class="w-full rounded-full px-12 py-4 text-lg font-medium transition-all focus:outline-none"
							style="border: 1px solid var(--color-theme-3); background: transparent;"
							placeholder="0.00"
							bind:value={price}
							onfocus={(e) =>
								((e.target as HTMLInputElement).style.border =
									'1px solid var(--color-theme-1)')}
							onblur={(e) =>
								((e.target as HTMLInputElement).style.border =
									'1px solid var(--color-theme-3)')}
						/>
						<span
							class="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold"
							style="color: var(--color-theme-1);"
						>
							$
						</span>
					</div>
				</div>

				<!-- File Upload -->
				<div class="form-field opacity-0">
					<label
						for="file-upload"
						class="mb-3 block text-lg font-bold"
						style="color: var(--color-theme-4);"
					>
						Additional Images (Optional)
					</label>
					{#if currentImages.length > 0}
						<div class="mb-4">
							<p class="text-sm text-gray-600 mb-2">Current Images:</p>
							<div class="flex gap-2 overflow-x-auto">
								{#each currentImages as image}
									<img src={image} alt="Current image" class="h-20 w-20 rounded object-cover" />
								{/each}
							</div>
						</div>
					{/if>
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
							class="rounded-2xl border border-dashed p-8 text-center transition-all"
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
									? `${files.length} new file(s) selected`
									: 'Click to add more images'}
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

				<!-- Submit Button -->
				<div class="form-field pt-4 opacity-0">
					<Button
						text={isSubmitting
							? 'Updating...'
							: 'Update Listing'}
						icon={isSubmitting
							? 'fa-spinner fa-spin'
							: 'fa-edit'}
						onclick={submit}
						disabled={isSubmitting}
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
</style>