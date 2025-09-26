<script lang="ts">
	import ResourceSearch from '$lib/components/resource/ResourceSearch.svelte';

	let { data } = $props();
</script>

<ResourceSearch {data} />
