<script lang="ts">
	import type { PageData } from './$types';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	export let data: PageData;

	let loading = false;
	let users = [];
	let search_term = '';

	async function handleSearch() {
		if (!search_term) {
			users = [];
			return;
		}
		loading = true;
		try {
			const response = await fetch(`/api/search/user?q=${search_term}`);
			if (!response.ok) throw new Error('Request failed');
			const result = await response.json();
			users = result.results;
		} catch (err) {
			console.error(err);
		} finally {
			loading = false;
		}
	}
</script>

<div class="container-narrow">
	<h1 class="text-sky">Search for a user</h1>
	<form on:submit|preventDefault={handleSearch}>
		<input
			class="input-primary"
			type="text"
			bind:value={search_term}
			placeholder="Enter a username"
		/>
		<button class="btn-primary" type="submit" disabled={loading}>
			{#if loading}
				Searching...
			{:else}
				Search
			{/if}
		</button>
	</form>

	{#if users.length > 0}
		<div class="mt-wave">
			<h2 class="text-horizon">Search Results</h2>
			<ul class="mt-flow">
				{#each users as user}
					<li transition:fade>
						<a href={`/u/${user.payload.u}`} class="text-primary hover:underline">
							{user.payload.u}
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
