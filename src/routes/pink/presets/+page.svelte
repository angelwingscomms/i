<script lang="ts">
	import SearchPresets from '$lib/components/pink/SearchPresets.svelte';

	function on_select() {}
</script>

<div class="page pad">
	<h1 class="title">presets</h1>
	<div class="card" style="background: transparent; border: 1px solid var(--color-theme-6);">
		<SearchPresets onSelect={on_select} />
	</div>
</div>
