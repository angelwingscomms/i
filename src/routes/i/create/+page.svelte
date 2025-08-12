<script lang="ts">
	import { toast } from '$lib/util/toast';
	import { onMount } from 'svelte';
	import { animate, createTimeline, stagger } from 'animejs';

	let name = $state('');
	let desc = $state('');
	let kind = $state<0 | 1>(0);
	let files: FileList | null = $state(null);
	let isSubmitting = $state(false);

	onMount(() => {
		// Page entrance animations
		const timeline = createTimeline()
		.add('.page-header', {
			opacity: [0, 1],
			translateY: [50, 0],
			duration: 800,
		})
		.add('.form-section', {
			opacity: [0, 1],
			translateY: [30, 0],
			duration: 600,
		}, '-=400')
		.add('.form-field', {
			opacity: [0, 1],
			translateY: [20, 0],
			duration: 400,
			delay: stagger(100),
		}, '-=200');

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
		Array.from(files).forEach((f) => fd.append('files', f));
		const res = await fetch('/i/upload', { method: 'POST', body: fd });
		if (!res.ok) return [];
		const { x } = (await res.json()) as { x: string[] };
		return x || [];
	}

	async function submit() {
		if (!name.trim()) {
			toast.error('Name is required');
			return;
		}

		isSubmitting = true;

		// Submit button animation
		animate('.submit-button', {
			scale: [1, 0.95, 1],
			duration: 300,
			ease: 'outElastic(1, .8)'
		});

		try {
			const x = await upload_files();
			const res = await fetch('/i/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ t: name, d: desc, k: kind, x })
			});
			if (!res.ok) throw new Error('create failed');
			const { i } = await res.json();

			// Success animation
			animate('.form-section', {
				scale: [1, 1.02, 1],
				duration: 500,
				ease: 'outElastic(1, .8)'
			});

			toast.success('item created');
			window.location.href = `/i/${i}`;
		} catch {
			toast.error('failed to create item');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-tertiary">
	<!-- Floating background elements -->
	<div class="absolute inset-0 overflow-hidden">
		<div class="floating-orb absolute -top-20 -left-20 h-64 w-64 rounded-full opacity-20" style="background: var(--color-theme-1);"></div>
		<div class="floating-orb absolute -bottom-20 -right-20 h-80 w-80 rounded-full opacity-15" style="background: var(--color-theme-6);"></div>
		<div class="floating-orb absolute top-1/4 right-1/4 h-32 w-32 rounded-full opacity-10" style="background: var(--color-theme-3);"></div>
	</div>

	<!-- Page Header -->
	<div class="page-header relative z-10 px-4 py-16 text-center opacity-0 sm:py-12">
		<div class="mx-auto max-w-4xl">
			<h1 class="mb-6 text-6xl font-black sm:text-4xl" style="color: var(--color-theme-4);">
				Create Your <span style="color: var(--color-theme-1);">Listing</span>
			</h1>
			<p class="text-xl text-gray-600 dark:text-gray-300 sm:text-lg">
				Share your amazing products and services with the community
			</p>
		</div>
	</div>

	<!-- Form Section -->
	<div class="form-section relative z-10 mx-auto max-w-2xl px-4 pb-16 opacity-0">
		<div class="rounded-3xl p-8 sm:p-6" style="background: transparent; border: 1px solid var(--color-theme-6);">
			<div class="space-y-8">
				<!-- Name Field -->
				<div class="form-field opacity-0">
					<label for="item-name" class="mb-3 block text-lg font-bold" style="color: var(--color-theme-4);">
						<span style="color: var(--color-theme-1);">*</span> Item Name
					</label>
					<input
						id="item-name"
						class="w-full rounded-full px-6 py-4 text-lg font-medium transition-all focus:outline-none"
						style="border: 1px solid var(--color-theme-6); background: transparent;"
						placeholder="Enter a catchy name for your item..."
						bind:value={name}
						onfocus={(e) => (e.target as HTMLInputElement).style.border = '1px solid var(--color-theme-1)'}
						onblur={(e) => (e.target as HTMLInputElement).style.border = '1px solid var(--color-theme-6)'}
					/>
				</div>

				<!-- Description Field -->
				<div class="form-field opacity-0">
					<label for="item-description" class="mb-3 block text-lg font-bold" style="color: var(--color-theme-4);">
						Description
					</label>
					<textarea
						id="item-description"
						class="w-full rounded-2xl px-6 py-4 text-lg font-medium transition-all focus:outline-none min-h-[120px]"
						style="border: 1px solid var(--color-theme-6); background: transparent;"
						placeholder="Describe your item in detail. What makes it special?"
						bind:value={desc}
						onfocus={(e) => (e.target as HTMLTextAreaElement).style.border = '1px solid var(--color-theme-1)'}
						onblur={(e) => (e.target as HTMLTextAreaElement).style.border = '1px solid var(--color-theme-6)'}
					></textarea>
				</div>

				<!-- Type Selection -->
				<div class="form-field opacity-0">
					<fieldset>
						<legend class="mb-3 block text-lg font-bold" style="color: var(--color-theme-4);">
							<span style="color: var(--color-theme-1);">*</span> Type
						</legend>
						<div class="flex gap-4">
							<label class="flex-1">
								<input type="radio" class="sr-only" bind:group={kind} value={0} />
								<div class="cursor-pointer rounded-full px-6 py-4 text-center text-lg font-bold transition-all" style="{kind === 0 ? `background: transparent; border: 1px solid var(--color-theme-1); color: var(--color-theme-1);` : `background: transparent; border: 1px solid var(--color-theme-6); color: var(--color-theme-4);`}">
									🛍️ Product
								</div>
							</label>
							<label class="flex-1">
								<input type="radio" class="sr-only" bind:group={kind} value={1} />
								<div class="cursor-pointer rounded-full px-6 py-4 text-center text-lg font-bold transition-all" style="{kind === 1 ? `background: transparent; border: 1px solid var(--color-theme-2); color: var(--color-theme-2);` : `background: transparent; border: 1px solid var(--color-theme-6); color: var(--color-theme-4);`}">
									⚡ Service
								</div>
							</label>
						</div>
					</fieldset>
				</div>

				<!-- File Upload -->
				<div class="form-field opacity-0">
					<label for="file-upload" class="mb-3 block text-lg font-bold" style="color: var(--color-theme-4);">
						Images (Optional)
					</label>
					<div class="relative">
						<input
							id="file-upload"
							type="file"
							multiple
							accept="image/*"
							class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
							onchange={(e) => (files = (e.target as HTMLInputElement).files)}
						/>
						<div class="rounded-2xl border border-dashed p-8 text-center transition-all" style="border-color: var(--color-theme-6); background: transparent;">
							<div class="mb-4 text-4xl">📸</div>
							<p class="text-lg font-medium" style="color: var(--color-theme-4);">
								{files && files.length > 0 ? `${files.length} file(s) selected` : 'Click to upload images'}
							</p>
							<p class="mt-2 text-sm" style="color: var(--color-theme-6);">
								PNG, JPG, GIF up to 10MB each
							</p>
						</div>
					</div>
				</div>

				<!-- Submit Button -->
				<div class="form-field opacity-0 pt-4">
					<button
						class="submit-button w-full rounded-full px-8 py-6 text-2xl font-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
						style="background: transparent; border: 1px solid var(--color-theme-1); color: var(--color-theme-1);"
						onclick={submit}
						disabled={isSubmitting}
					>
						{#if isSubmitting}
							<div class="flex items-center justify-center gap-3">
								<div class="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
								Creating...
							</div>
						{:else}
							<div class="flex items-center justify-center gap-3">
								<span>✨</span>
								Create {kind === 0 ? 'Product' : 'Service'}
								<span>🚀</span>
							</div>
						{/if}
					</button>
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
		0%, 100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-30px) rotate(180deg);
		}
	}

	.page-header, .form-section, .form-field {
		opacity: 0;
	}

	.submit-button:hover:not(:disabled) {
		transform: translateY(-3px);
		box-shadow: 0 20px 40px rgba(182, 55, 250, 0.3);
	}
</style>

