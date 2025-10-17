<script lang="ts">
	import { ItemSearch } from '$lib/components/items';
	import Button from '$lib/components/Button.svelte';

	let { data } = $props();
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
					<p class="text-white/80">
						find products and services
					</p>
				</div>
				{#if data.user}
					<Button
						href="/items/create"
						text="create item"
						icon="fa-plus"
					/>
				{/if}
			</div>
		</div>
	</div>

	<ItemSearch {data} />
</div>
