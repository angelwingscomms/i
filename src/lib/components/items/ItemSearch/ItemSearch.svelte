<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Select from '$lib/components/Select.svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import {
		persist_item_search_state,
		restore_item_search_state,
		parse_item_kind,
		parse_item_sort
	} from '$lib/util/items/item_search';
	import type { ItemSort } from '$lib/util/items/types';
	import { fetch_items } from '$lib/util/items/fetch_items';
	import { noop } from '$lib/util/items/noop';
	import type { Item } from '$lib/types/item';

	interface Props {
		query?: string;
		kind?: 0 | 1 | undefined;
		sort?: ItemSort;
		results?: (Item & { score?: number })[];
		showKind?: boolean;
		showSort?: boolean;
	}

	let {
		query = $bindable(''),
		kind = $bindable<0 | 1 | undefined>(undefined),
		sort = $bindable<ItemSort>('relevance'),
		results = $bindable<(Item & { score?: number })[]>([]),
		showKind = true,
		showSort = true
	}: Props = $props();

	let search_timeout = $state<NodeJS.Timeout | null>(null);
	let searching = $state(false);

	const execute_search = async () => {
		searching = true;
		try {
			const items = await fetch_items({
				q: query.trim() || undefined,
				k: kind,
				s: sort,
				l: 50
			});
			results = items;
		} catch (error) {
			console.error('item search error', error);
			results = [];
		} finally {
			searching = false;
		}
	};

	const debounce_search = () => {
		if (search_timeout) clearTimeout(search_timeout);
		if (!query) return;
		search_timeout = setTimeout(() => {
			execute_search();
		}, 2160);
	};

	const immediate_search = () => {
		if (search_timeout) clearTimeout(search_timeout);
		execute_search();
	};

	const clear_search = () => {
		query = '';
		if (search_timeout) clearTimeout(search_timeout);
		search_timeout = null;
	};

	const handle_search = () => debounce_search();

	const handle_kind_change = (value: string) => {
		kind = parse_item_kind(value);
		immediate_search();
	};

	const handle_sort_change = (value: string) => {
		sort = parse_item_sort(value);
		immediate_search();
	};

	$effect(() => {
		if (browser) {
			persist_item_search_state(localStorage, {
				q: query,
				k: kind,
				s: sort
			});
		}
	});

	onMount(() => {
		if (!browser) return;
		const restored =
			restore_item_search_state(localStorage);
		if (!restored) return;
		query = restored.q ?? '';
		kind = restored.k;
		sort = restored.s;
		immediate_search();
	});
</script>

<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
	<div class="md:col-span-2">
		<label
			for="query"
			class="text-theme-4 mb-2 block text-sm font-medium"
		>
			search
		</label>
		<div class="relative">
		<DescriptionInput
			bind:value={query}
			placeholder="search for items..."
			send={handle_search}
			send_loading={searching}
			label=""
			voice_typing={true}
			ontranscribe={noop}
		/>
			{#if query}
				<button
					onclick={clear_search}
					class="absolute top-2 right-2 z-10 rounded border-t border-r border-[var(--color-theme-1)] text-gray-400 hover:text-gray-600"
					aria-label="clear search"
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
				onclick={handle_kind_change}
			/>
		</div>
	{/if}

	{#if showSort}
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
					{ value: 'newest', label: 'newest first' },
					{ value: 'oldest', label: 'oldest first' },
					{ value: 'name', label: 'name a-z' },
					{ value: 'price', label: 'price low-high' }
				]}
				value={sort}
				placeholder="select sort"
				onclick={handle_sort_change}
			/>
		</div>
	{/if}
</div>
