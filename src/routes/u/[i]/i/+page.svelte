<script lang="ts">
	import { onMount } from 'svelte';
	import {
		animate,
		createTimeline,
		stagger
	} from 'animejs';
import { ItemSearch } from '$lib/components/i';
	import type { PageData } from '../../../i/$types';
	import type { Item } from '$lib/types/item';
	import axios from 'axios';
	import { toast } from '$lib/util/toast.svelte';

	interface ItemPageData extends PageData {
		items: Item[];
	}

	let { data } = $props<{ data: ItemPageData }>();
	let query = $state(''),
		searching = $state(false);
	let filtered_items = $state(data.i);

	async function search() {
		searching = true;
		if (!query) {
			filtered_items = data.i;
			searching = false;
			return;
		}

		try {
			const response = await axios.post('/i', {
				q: query.trim(),
				limit: 50
			});
			filtered_items = response.data;
		} catch (error) {
			console.error('Error searching items:', error);
			toast.error('Failed to search items');
		} finally {
			searching = false;
		}
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
				'.items-grid',
				{
					opacity: [0, 1],
					translateY: [30, 0],
					duration: 600
				},
				'-=400'
			)
			.add(
				'.item-card',
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

<div
	class="min-h-screen"
	style="background: var(--bg-primary);"
>
	<!-- Page Header -->
	<div
		class="page-header px-4 py-16 text-center opacity-0 sm:py-12"
	>
		<div class="mx-auto max-w-4xl">
			<h1
				class="mb-6 text-6xl font-black sm:text-4xl"
				style="color: var(--color-theme-4);"
			>
				discover amazing <span
					style="color: var(--color-theme-1);"
					>items</span
				>
			</h1>
			<p
				class="text-xl text-gray-600 sm:text-lg dark:text-gray-300"
			>
				find products and services from your community
			</p>
			<div class="mt-8 flex justify-center">
				<div class="w-full max-w-md">
					<ItemSearch
						bind:query
						onsearch={search}
						{searching}
						showKind={false}
						showSort={false}
					/>
				</div>
			</div>
			{#if data.user}
				<div class="mt-8">
					<a
						href="/i/create"
						class="btn-primary btn-lg"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="currentColor"
						>
							<path
								d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z"
							/>
						</svg>
						create item
					</a>
				</div>
			{/if}
		</div>
	</div>

	<!-- Items Grid -->
	<div
		class="items-grid mx-auto max-w-6xl px-4 pb-16 opacity-0"
	>
		{#if filtered_items.length > 0}
			<div
				class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
			>
				{#each filtered_items as item (item.i)}
					<a
						href="/i/{item.i}"
						class="item-card card-hover card-normal no-underline"
					>
						<div class="mb-4">
							<div
								class="mb-2 flex items-center justify-between"
							>
								<span
									class="rounded-full px-3 py-1 text-sm font-medium"
									style="border: 1px solid var(--color-theme-{item.k ===
									0
										? '1'
										: '2'}); color: var(--color-theme-{item.k ===
									0
										? '1'
										: '2'});"
								>
									{item.k === 0
										? '🛍️ product'
										: '⚡ service'}
								</span>
								<span class="text-xs text-gray-500">
									{item.a
										? new Date(
												item.a
											).toLocaleDateString()
										: 'n/a'}
								</span>
							</div>
							<h3
								class="mb-2 text-xl font-bold"
								style="color: var(--color-theme-4);"
							>
								{item.n}
							</h3>
							{#if item.d}
								<p
									class="line-clamp-3 text-sm text-gray-600 dark:text-gray-300"
								>
									{item.d}
								</p>
							{/if}
						</div>

						{#if item.x && item.x.length > 0}
							<div class="mb-4">
								<img
									src={item.x[0]}
									alt={item.n}
									class="h-32 w-full rounded-lg object-cover"
								/>
							</div>
						{/if}

						<div
							class="flex items-center justify-between text-sm"
						>
							<span class="text-gray-500"
								>view details</span
							>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="currentColor"
								style="color: var(--color-theme-1);"
							>
								<path
									d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
								/>
							</svg>
						</div>
					</a>
				{/each}
			</div>
		{:else if search_term}
			<div class="py-16 text-center">
				<div class="mb-6 text-6xl">🔍</div>
				<h3
					class="mb-4 text-2xl font-bold"
					style="color: var(--color-theme-4);"
				>
					no results for "{search_term}"
				</h3>
				<p
					class="mb-8 text-lg"
					style="color: var(--color-theme-6);"
				>
					try a different search term or create a new
					item.
				</p>
				{#if data.user}
					<a
						href="/i/create"
						class="btn-primary btn-lg"
					>
						create new item
					</a>
				{/if}
			</div>
		{:else}
			<div class="py-16 text-center">
				<div class="mb-6 text-6xl">📦</div>
				<h3
					class="mb-4 text-2xl font-bold"
					style="color: var(--color-theme-4);"
				>
					no items yet
				</h3>
				<p
					class="mb-8 text-lg"
					style="color: var(--color-theme-6);"
				>
					be the first to share something amazing!
				</p>
				{#if data.user}
					<a
						href="/i/create"
						class="btn-primary btn-lg"
					>
						create first item
					</a>
				{:else}
					<a
						href="/google"
						class="btn-primary btn-lg"
					>
						sign in to create
					</a>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.page-header,
	.items-grid,
	.item-card {
		opacity: 0;
	}

	.line-clamp-3 {
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
