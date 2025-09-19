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
			const x = await upload_files();
			const res = await fetch('/i/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					t: name,
					d: desc,
					k: kind,
					x
				})
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
		} catch (error) {
			toast.error('failed to create item');
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
				Create Your <span
					style="color: var(--color-theme-1);"
					>Listing</span
				>
			</h1>
			<p
				class="text-xl text-gray-600 sm:text-lg dark:text-gray-300"
			>
				Share your amazing products and services with
				the community
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
							((
								e.target as HTMLInputElement
							).style.border =
								'1px solid var(--color-theme-1)')}
						onblur={(e) =>
							((
								e.target as HTMLInputElement
							).style.border =
								'1px solid var(--color-theme-3)')}
					/>
				</div>

				<!-- Description Field -->
				<div class="form-field opacity-0">
					<DescriptionInput
						bind:value={desc}
						endpoint=""
						placeholder="Describe your item in detail. What makes it special?"
						rows={5}
						label="Description"
						editable={true}
					/>
				</div>

				<!-- Type Selection -->
				<div class="form-field opacity-0">
					<label
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
							class={kind === 0 ? 'active' : ''}
							style={kind === 0
								? `background: transparent; border: 1px solid var(--color-theme-1); color: var(--color-theme-1);`
								: `background: transparent; border: 1px solid var(--color-theme-3); color: var(--color-theme-4);`}
						/>
						<Button
							text="Service"
							icon="fa-wrench"
							onclick={() => (kind = 1)}
							class={kind === 1 ? 'active' : ''}
							style={kind === 1
								? `background: transparent; border: 1px solid var(--color-theme-2); color: var(--color-theme-2);`
								: `background: transparent; border: 1px solid var(--color-theme-3); color: var(--color-theme-4);`}
						/>
					</div>
				</div>

				<!-- File Upload -->
				<div class="form-field opacity-0">
					<label
						for="file-upload"
						class="mb-3 block text-lg font-bold"
						style="color: var(--color-theme-4);"
					>
						Images (Optional)
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
									? `${files.length} file(s) selected`
									: 'Click to upload images'}
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
							? 'Creating...'
							: `Create ${kind === 0 ? 'Product' : 'Service'}`}
						icon={isSubmitting
							? 'fa-spinner fa-spin'
							: 'fa-magic'}
						onclick={submit}
						disabled={isSubmitting}
						class="submit-button w-full !rounded-full !px-8 !py-6 !text-2xl !font-black"
						style="background: transparent; border: 1px solid var(--color-theme-1); color: var(--color-theme-1);"
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

	.submit-button:hover:not(:disabled) {
		transform: translateY(-3px);
		box-shadow: 0 20px 40px rgba(182, 55, 250, 0.3);
	}

	/* Active button glow effect */
	.active-button:hover {
		transform: translateY(-3px);
		box-shadow: 0 20px 40px rgba(182, 55, 250, 0.3);
	}
</style>
