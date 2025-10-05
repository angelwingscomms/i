<script lang="ts">
	import { ItemSearch } from '$lib/components/item';
	import Button from '$lib/components/Button.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>discover items - apexlinks</title>
	<meta
		name="description"
		content="find products and services from your community"
	/>
</svelte:head>

<div
	class="min-h-screen"
	style="background: var(--bg-primary);"
>
	<!-- Page Header -->
	<div class="px-4 py-16 text-center sm:py-12">
		<div class="mx-auto max-w-4xl">
			<h1
				class="mb-6 text-6xl font-black sm:text-4xl"
				style="color: var(--color-theme-4);"
			>
				discover amazing <span
					style="color: var(--color-theme-1);"
					>items</span
				>
			</h1>
			<p
				class="text-xl text-gray-600 sm:text-lg dark:text-gray-300"
			>
				find products and services from your community
			</p>
			{#if data.user}
				<div class="mt-8">
					<Button
						href="/i/create"
						text="create item"
						icon="fa-plus"
					/>
				</div>
			{/if}
		</div>
	</div>

	<ItemSearch {data} />
</div>
