<script lang="ts">
	import ResourceCard from './ResourceCard.svelte';
	import type { Resource } from '$lib/types/resource';

	let { results } = $props<{ results: Resource[] }>();
</script>

<div class="space-y-3">
	{#each results as resource (resource.n)}
		<ResourceCard {resource} />
	{/each}
</div>

{#if results.length === 0}
	<div class="rounded-lg py-12 text-center">
		<div class="mb-2 text-lg text-gray-500">
			No resources found
		</div>
		<p class="text-sm text-gray-400">
			Try adjusting your search terms or filters
		</p>
	</div>
{/if}
