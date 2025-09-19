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
	<div
		class="rounded-lg py-12 text-center"
	>
		<div class="mb-2 text-lg text-gray-500">
			No items found
		</div>
		<p class="text-sm text-gray-400">
			Try adjusting your search terms or filters
		</p>
	</div>
{/if}
