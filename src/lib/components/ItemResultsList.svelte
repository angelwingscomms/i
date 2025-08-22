<script lang="ts">
	import ItemCard from './ItemCard.svelte';

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

	let { results } = $props<{ results: Item[] }>();
</script>

<div class="space-y-3">
	{#each results as item (item.i)}
		<ItemCard {item} />
	{/each}
</div>

{#if results.length === 0}
	<div class="text-center py-12">
		<div class="text-gray-500 text-lg mb-2">No items found</div>
		<p class="text-gray-400 text-sm">Try adjusting your search terms or filters</p>
	</div>
{/if}
