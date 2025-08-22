<script lang="ts">
	import { onMount } from 'svelte';
	import { animate, createTimeline, stagger } from 'animejs';
	import type { PageData } from '../../../i/$types';

	export let data: PageData;

	onMount(() => {
		// Page entrance animations
		const timeline = createTimeline()
		.add('.page-header', {
			opacity: [0, 1],
			translateY: [50, 0],
			duration: 800,
		})
		.add('.items-grid', {
			opacity: [0, 1],
			translateY: [30, 0],
			duration: 600,
		}, '-=400')
		.add('.item-card', {
			opacity: [0, 1],
			translateY: [20, 0],
			duration: 400,
			delay: stagger(100),
		}, '-=200');

		// Interactive hover animations
		document.addEventListener('mouseover', (e) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('item-card')) {
				animate(target, {
					scale: 1.02,
					translateY: -5,
					duration: 300,
					ease: 'outQuart'
				});
			}
		});

		document.addEventListener('mouseout', (e) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('item-card')) {
				animate(target, {
					scale: 1,
					translateY: 0,
					duration: 300,
					ease: 'outQuart'
				});
			}
		});
	});
</script>

<div class="min-h-screen" style="background: var(--bg-primary);">
	<!-- Page Header -->
	<div class="page-header px-4 py-16 text-center opacity-0 sm:py-12">
		<div class="mx-auto max-w-4xl">
			<h1 class="mb-6 text-6xl font-black sm:text-4xl" style="color: var(--color-theme-4);">
				Discover Amazing <span style="color: var(--color-theme-1);">Items</span>
			</h1>
			<p class="text-xl text-gray-600 sm:text-lg dark:text-gray-300">
				Find products and services from your community
			</p>
			{#if data.user}
				<div class="mt-8">
					<a href="/i/create" class="btn-primary btn-lg">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"/>
						</svg>
						Create Item
					</a>
				</div>
			{/if}
		</div>
	</div>

	<!-- Items Grid -->
	<div class="items-grid mx-auto max-w-6xl px-4 pb-16 opacity-0">
		{#if data.items.length > 0}
			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each data.items as item (item.i)}
					<a href="/i/{item.i}" class="item-card card-hover card-normal no-underline">
						<div class="mb-4">
							<div class="flex items-center justify-between mb-2">
								<span class="text-sm font-medium rounded-full px-3 py-1" style="border: 1px solid var(--color-theme-{item.k === 0 ? '1' : '2'}); color: var(--color-theme-{item.k === 0 ? '1' : '2'});">
									{item.k === 0 ? '🛍️ Product' : '⚡ Service'}
								</span>
								<span class="text-xs text-gray-500">
									{new Date(item.a).toLocaleDateString()}
								</span>
							</div>
							<h3 class="text-xl font-bold mb-2" style="color: var(--color-theme-4);">
								{item.t}
							</h3>
							{#if item.d}
								<p class="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
									{item.d}
								</p>
							{/if}
						</div>
						
						{#if item.x && item.x.length > 0}
							<div class="mb-4">
								<img src={item.x[0]} alt={item.t} class="w-full h-32 object-cover rounded-lg" />
							</div>
						{/if}

						<div class="flex items-center justify-between text-sm">
							<span class="text-gray-500">View Details</span>
							<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style="color: var(--color-theme-1);">
								<path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"/>
							</svg>
						</div>
					</a>
				{/each}
			</div>
		{:else}
			<div class="text-center py-16">
				<div class="mb-6 text-6xl">📦</div>
				<h3 class="mb-4 text-2xl font-bold" style="color: var(--color-theme-4);">No items yet</h3>
				<p class="text-lg mb-8" style="color: var(--color-theme-6);">Be the first to share something amazing!</p>
				{#if data.user}
					<a href="/i/create" class="btn-primary btn-lg">
						Create First Item
					</a>
				{:else}
					<a href="/google" class="btn-primary btn-lg">
						Sign In to Create
					</a>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.page-header, .items-grid, .item-card {
		opacity: 0;
	}

	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
