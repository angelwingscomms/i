<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { ZoneSearch } from '$lib/components/zone';
	import type { Zone } from '$lib/types/zone';

	let { data } = $props<{ data: { z: Zone[] } }>();
	let query = $state('');
	let zones = $state(data.z ?? []);
	let loading = $state(false);
</script>

<svelte:head>
	<title>zones</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-[var(--background)] to-[var(--surface)]">
	<div class="bg-gradient-to-r from-theme-1 to-theme-2">
		<div class="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10 text-white md:flex-row md:items-center md:justify-between">
			<div>
				<h1 class="text-3xl font-bold md:text-4xl">zones</h1>
				<p class="mt-2 text-white/80">explore communities near you</p>
			</div>
			<Button
				text="add zone"
				href="/zones/create"
				icon="fa-plus"
			/>
		</div>
	</div>

	<div class="mx-auto max-w-4xl px-4 py-10">
		<div class="mb-6 flex items-center justify-between">
			<h2 class="text-xl font-semibold text-[var(--color-theme-4)]">
				{zones.length} zones
			</h2>
			{#if loading}
				<span class="text-sm text-[var(--color-theme-3)]">searching...</span>
			{/if}
		</div>
		<ZoneSearch
			bind:q={query}
			bind:zones
			bind:loading
			initial_zones={data.z}
			onSearch={(list) => (zones = list)}
		/>
	</div>
</div>
