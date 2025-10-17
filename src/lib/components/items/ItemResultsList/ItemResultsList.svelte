<script lang="ts">
	import type { Item } from '$lib/types/item';
	import ItemCard from '../ItemCard/ItemCard.svelte';

	type ItemWithScore = Item & { score?: number };

	let { results } = $props<{
		results: ItemWithScore[];
	}>();
</script>

<div
	class="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
>
	{#each results as item (item.i)}
		<ItemCard {item} />
	{/each}
</div>

{#if results.length === 0}
	<div class="rounded-lg py-12 text-center">
		<div class="mb-2 text-lg text-gray-500">
			no items found
		</div>
		<p class="text-sm text-gray-400">
			try adjusting your search terms or filters
		</p>
	</div>
{/if}
