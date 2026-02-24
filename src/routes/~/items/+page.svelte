<script lang="ts">
	import { Items } from '$lib/components/items';

	let { data } = $props();
</script>

<svelte:head>
	<title>search items - apexlinks</title>
	<meta
		name="description"
		content="find products and services"
	/>
</svelte:head>

<Items />
