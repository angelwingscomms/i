<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Select from '$lib/components/Select.svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';

	interface Props {
		query?: string;
		kind?: 0 | 1 | undefined;
		sort?: 'relevance' | 'newest' | 'oldest';
		searching?: boolean;
		showKind?: boolean;
		showSort?: boolean;
		onsearch?: () => void;
	}

	let {
		query = $bindable(''),
		kind = $bindable<0 | 1 | undefined>(undefined),
		sort = $bindable<
			'relevance' | 'newest' | 'oldest'
		>('relevance'),
		searching = $bindable(false),
		showKind = true,
		showSort = true,
		onsearch
	}: Props = $props();

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
				if (onsearch) onsearch();
			}
		}
	});

	function clearSearch() {
		query = '';
	}

	function handleSearch() {
		// Clear previous timeout
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		searchTimeout = setTimeout(() => {
			if (onsearch) onsearch();
		}, 2160);
	}

	function handleKindChange(v: string) {
		kind = v ? (Number(v) as 0 | 1) : undefined;
		handleSearch();
	}

	function handleSortChange(v: string) {
		sort = v as 'relevance' | 'newest' | 'oldest';
		handleSearch();
	}
</script>

<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
	<!-- Search Query -->
	<div class="md:col-span-2">
		<label
			for="query"
			class="text-theme-4 mb-2 block text-sm font-medium"
		>
			Search
		</label>
		<div class="relative">
			<DescriptionInput
				bind:value={query}
				placeholder="search for items..."
				send={handleSearch}
				send_loading={searching}
				label=""
				voice_typing={true}
				ontranscribe={() => {}}
			/>
			{#if query}
				<button
					onclick={clearSearch}
					class="absolute top-2 right-2 z-10 rounded border-t border-r [border-color:var(--color-theme-1)] text-gray-400 hover:text-gray-600"
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

	{#if showKind}
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
					{
						value: '0',
						label: 'products',
						icon: 'fa-shopping-bag'
					},
					{
						value: '1',
						label: 'services',
						icon: 'fa-wrench'
					}
				]}
				value={kind === undefined ? '' : String(kind)}
				placeholder="select type"
				onclick={handleKindChange}
			/>
		</div>
	{/if}

	{#if showSort}
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
					{
						value: 'relevance',
						label: 'relevance'
					},
					{ value: 'newest', label: 'newest' },
					{ value: 'oldest', label: 'oldest' }
				]}
				value={sort}
				placeholder="select sort"
				onclick={handleSortChange}
			/>
		</div>
	{/if}
</div>
