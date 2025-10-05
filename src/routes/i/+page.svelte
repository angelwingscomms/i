<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import {
		ItemResultsList,
		ItemSearch
	} from '$lib/components/i';
	import type { Item } from '$lib/types/item';
	import type { ItemSort } from '$lib/util/i/types';
	import { create_item_search_executor } from '$lib/util/i/item_search';

	type ItemWithScore = Item & { score?: number };

	let { data } = $props<{
		data: {
			user?: unknown;
			results?: ItemWithScore[];
		};
	}>();

	let user = $derived(data?.user);
	let results = $state<ItemWithScore[]>(
		(data?.results ?? []) as ItemWithScore[]
	);
	let query = $state('');
	let kind = $state<0 | 1 | undefined>(undefined);
	let sort = $state<ItemSort>('relevance');
	let searching = $state(false);

	const execute_search = create_item_search_executor({
		get_query: () => query,
		get_kind: () => kind,
		get_sort: () => sort,
		set_results: (items) => (results = items),
		set_searching: (value) => (searching = value)
	});
</script>

<svelte:head>
	<title>search items - apexlinks</title>
	<meta
		name="description"
		content="find products and services"
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
						search items
					</h1>
					<p class="text-white/80">find products and services</p>
				</div>
				{#if user}
					<Button
						href="/i/create"
						text="create item"
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
				onsearch={execute_search}
				{searching}
			/>
		</div>

		<!-- Results -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-xl font-semibold [color:var(--color-theme-4)]">
					results {#if !searching}({results.length}){/if}
				</h2>
			</div>

			<ItemResultsList {results} />
		</div>
	</div>
</div>
