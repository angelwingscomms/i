<script lang="ts">
	import { browser } from '$app/environment';
	import axios from 'axios';
	import { onMount } from 'svelte';
	import ItemResultsList from '$lib/components/ItemResultsList.svelte';
	import Button from '$lib/components/Button.svelte';
	import ItemSearch from '$lib/components/ItemSearch.svelte';

	type Item = {
		i: string;
		t?: string;
		d?: string;
		k?: number;
		a?: number;
		q?: string;
		x?: string[];
		score?: number;
	};

	let { data } = $props();
	let user = $derived(data?.user);
	let results = $derived(
		data?.results || ([] as Item[])
	);

	let query = $state('');
	let kind = $state<0 | 1 | undefined>(undefined);
	let sort = $state<
		'relevance' | 'newest' | 'oldest'
	>('relevance');
	let searching = $state(false);
	let searchTimeout = $state<NodeJS.Timeout | null>(
		null
	);

	// Reactive statement to sync search query to localStorage
	$effect(() => {
		if (browser) {
			localStorage.setItem(
				'item_search_query',
				JSON.stringify({ query, kind, sort })
			);
		}
	});

	onMount(() => {
		if (browser) {
			const savedQuery = localStorage.getItem(
				'item_search_query'
			);
			if (savedQuery) {
				const { q, k, s } = JSON.parse(savedQuery);
				query = q || '';
				kind = k;
				sort = s || 'relevance';
				search();
			}
		}
	});

	async function search(_?: any) {
		searching = true;

		// Clear previous timeout
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}
		searchTimeout = setTimeout(async () => {
			try {
				const payload: Record<string, unknown> = {
					q: query.trim() || undefined,
					kind,
					sort,
					limit: 50
				};

				const response = await axios.post(
					'/i',
					payload
				);
				results = response.data as Item[];
			} catch (error) {
				console.error('Search error:', error);
				results = [];
			} finally {
				searching = false;
			}
		}, 2160);
	}

	function clearSearch() {
		query = '';
	}
</script>

<svelte:head>
	<title>Search Items - Apexlinks</title>
	<meta
		name="description"
		content="Find products and services"
	/>
</svelte:head>

<div
	class="i-page from-background to-surface min-h-screen bg-gradient-to-br"
>
	<!-- Header -->
	<div
		class="from-theme-1 to-theme-2 bg-gradient-to-r text-white"
	>
		<div class="mx-auto max-w-4xl px-4 py-8">
			<div class="flex items-center justify-between">
				<div>
					<h1
						class="mb-2 flex items-center gap-3 text-4xl font-bold"
					>
						<i
							class="fa-solid fa-bag-shopping text-[1.5em] text-white"
						></i>
						Search Items
					</h1>
					<p class="text-white/80">
						Find products and services
					</p>
				</div>
				{#if user}
					<Button
						href="/i/create"
						text="Create Item"
						icon="fa-plus"
					/>
				{/if}
			</div>
		</div>
	</div>

	<!-- Search Form -->
	<div class="mx-auto max-w-4xl px-4 py-8">
		<div class="mb-8 rounded-lg p-6 shadow-lg">
			<ItemSearch
				bind:query
				bind:kind
				bind:sort
				onsearch={search}
				{searching}
			/>
		</div>

		<!-- Results -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2
					class="text-xl font-semibold [color:var(--color-theme-4)]"
				>
					Results {#if !searching}({results.length}){/if}
				</h2>
			</div>

			<ItemResultsList {results} />
		</div>
	</div>
</div>
