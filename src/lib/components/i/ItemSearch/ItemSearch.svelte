<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import Select from '$lib/components/Select.svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import {
		create_item_search_controller,
		persist_item_search_state,
		restore_item_search_state
	} from '$lib/util/i/item_search';
	import { noop } from '$lib/util/i/noop';

	type ItemSort = 'relevance' | 'newest' | 'oldest';

	interface Props {
		query?: string;
		kind?: 0 | 1 | undefined;
		sort?: ItemSort;
		searching?: boolean;
		showKind?: boolean;
		showSort?: boolean;
		onsearch?: () => void;
	}

	let {
		query = $bindable(''),
		kind = $bindable<0 | 1 | undefined>(undefined),
		sort = $bindable<ItemSort>('relevance'),
		searching = $bindable(false),
		showKind = true,
		showSort = true,
		onsearch
	}: Props = $props();

	let search_timeout = $state<NodeJS.Timeout | null>(
		null
	);

	const controller = create_item_search_controller({
		get_query: () => query,
		set_query: (value) => (query = value),
		get_kind: () => kind,
		set_kind: (value) => (kind = value),
		get_sort: () => sort,
		set_sort: (value) => (sort = value),
		get_timeout: () => search_timeout,
		set_timeout: (timeout) =>
			(search_timeout = timeout),
		onsearch
	});

	const {
		clear_search,
		handle_search,
		handle_kind_change,
		handle_sort_change,
		trigger_search
	} = controller;

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
		trigger_search();
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
					{ value: '', label: 'relevance' },
					{ value: 'name', label: 'name' },
					{ value: 'price', label: 'price' }
				]}
				value={sort}
				placeholder="select sort"
				onclick={handle_sort_change}
			/>
		</div>
	{/if}
</div>
