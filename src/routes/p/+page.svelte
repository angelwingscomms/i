<script lang="ts">
	import type { PageData } from './$types';
	import Button from '$lib/components/Button.svelte';
	import { toast } from '$lib/util/toast';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let {data}: PageData = $props();
	console.log('d', data);
	let { p: posts, q: query } = data;
	console.log('p', posts);
	// let search_query = query;
	let searching = $state(false);

	let search_query = $derived(query);

	async function performSearch() {
		searching = true;
		const url = new URL('/p', $page.url.origin);
		url.searchParams.set('q', search_query);
		await goto(url);
		searching = false;
	}
</script>

<svelte:head>
	<title>Posts - Apexlinks</title>
</svelte:head>

<div class="min-h-screen py-8">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<div class="mb-8 text-center">
			<h1
				class="mb-4 text-4xl font-bold text-gray-900"
			>
				Search Posts
			</h1>
			<div
				class="mx-auto flex max-w-md flex-col gap-4 sm:flex-row"
			>
				<input
					type="text"
					bind:value={search_query}
					placeholder="Search posts..."
					class="flex-1 blurry-search"
					on:keydown={(e) =>
						e.key === 'Enter' && performSearch()}
				/>
				<Button
					onClick={performSearch}
					disabled={searching}
					text={searching ? 'Searching...' : 'Search'}
				/>
			</div>
		</div>

		{#if posts.length === 0}
			<div class="py-12 text-center">
				<h2
					class="mb-2 text-2xl font-semibold text-gray-900"
				>
					No posts found
				</h2>
				<p class="text-gray-500">
					Try a different search term.
				</p>
			</div>
		{:else}
			<div class="grid gap-6">
				{#each posts as post}
					<a href={`/p/${post.i}`} class="block">
						<div
							class="card-normal transition-shadow hover:shadow-lg"
						>
							{#if post.p}
								<img
									src={post.p}
									alt={post.m}
									class="h-48 w-full rounded-t-lg object-cover"
								/>
							{/if}
							<div class="p-6">
								<h3
									class="mb-2 text-xl font-bold text-bright-magenta"
								>
									{post.t}
								</h3>
								<p class="mb-4 text-gray-600">
									{post.y}
								</p>
							</div>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
