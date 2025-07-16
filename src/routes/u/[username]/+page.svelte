<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<div class="container-narrow">
	<h1 class="text-sky">Comparison with {data.username}</h1>
	{#if data.error}
		<p class="text-error">{data.error}</p>
	{:else}
		<h2 class="text-horizon">You have in common:</h2>
		<ul class="mt-flow">
			{#each data.commonalities as item}
				<li>{item}</li>
			{/each}
		</ul>
	{/if}
</div>
