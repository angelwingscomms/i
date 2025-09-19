<script lang="ts">
	import { browser } from '$app/environment';
	import axios from 'axios';
	import { onMount } from 'svelte';
	import ItemResultsList from '$lib/components/ItemResultsList.svelte';
	import Button from '$lib/components/Button.svelte';
	import Select from '$lib/components/Select.svelte';


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

	let query = $state('');
	let kind = $state<0 | 1 | undefined>(undefined);
	let sort = $state<
		'relevance' | 'newest' | 'oldest'
	>('relevance');
	let loading = $state(false);
	let results = $state<Item[]>([]);
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
			}
			// Load initial results
			search();
		}
	});

	async function search() {
		loading = true;

		// Clear previous timeout
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

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
			loading = false;
		}
	}

	function debouncedSearch() {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		searchTimeout = setTimeout(() => {
			search();
		}, 300);
	}

	function clearSearch() {
		query = '';
		search();
	}
</script>

<svelte:head>
	<title>Search Items - Apexlinks</title>
	<meta
		name="description"
		content="Find products and services in your community"
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
					<h1 class="mb-2 text-4xl font-bold">
						Search Items
					</h1>
					<p class="text-white/80">
						Find products and services in your
						community
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
			<div
				class="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
			>
				<!-- Search Query -->
				<div class="md:col-span-2">
					<label
						for="query"
						class="text-theme-4 mb-2 block text-sm font-medium"
					>
						Search
					</label>
					<div class="relative">
						<input
							id="query"
							type="text"
							bind:value={query}
							oninput={debouncedSearch}
							placeholder="Search for items..."
							class="w-full rounded-full border-b-2 border-l-2 [border-color:var(--color-theme-1)] bg-transparent px-4 py-3 pr-12 transition-colors focus:[border-color:var(--color-theme-1)]"
						/>
						{#if query}
							<button
								onclick={clearSearch}
								class="absolute top-1/2 right-3 -translate-y-1/2 transform rounded border-t border-r [border-color:var(--color-theme-1)] text-gray-400 hover:text-gray-600"
								aria-label="Clear search"
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
									/>
								</svg>
							</button>
						{/if}
					</div>
				</div>

				<!-- Item Type -->
				<div>
					<label
						for="kind"
						class="text-theme-4 mb-2 block text-sm font-medium"
					>
						type
					</label>
					<Select
						options={[
							{ value: '', label: 'all items' },
							{ value: '0', label: '🛍️ products' },
							{ value: '1', label: '⚡ services' }
						]}
						value={kind === undefined ? '' : String(kind)}
						placeholder="select type"
						onclick={(v) => {
							kind = v ? (Number(v) as 0 | 1) : undefined;
							search();
						}}
					/>
				</div>

				<!-- Sort -->
				<div>
					<label
						for="sort"
						class="text-theme-4 mb-2 block text-sm font-medium"
					>
						sort by
					</label>
					<Select
						options={[
							{ value: 'relevance', label: 'relevance' },
							{ value: 'newest', label: 'newest' },
							{ value: 'oldest', label: 'oldest' }
						]}
						value={sort}
						placeholder="select sort"
						onclick={(v) => {
							sort = v as 'relevance' | 'newest' | 'oldest';
							search();
						}}
					/>
				</div>
			</div>

			<!-- Loading indicator -->
			{#if loading}
				<div class="mt-4 text-center">
					<div
						class="inline-flex items-center gap-2 rounded text-sm [color:var(--color-theme-1)]"
					>
						<div
							class="h-4 w-4 animate-spin border-2 [border-color:var(--color-theme-1)] [border-top-color:transparent]"
						></div>
						Searching...
					</div>
				</div>
			{/if}
		</div>

		<!-- Results -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2
					class="text-xl font-semibold [color:var(--color-theme-4)]"
				>
					Results {#if !loading}({results.length}){/if}
				</h2>
			</div>

			<ItemResultsList {results} />
		</div>
	</div>
</div>
