<script lang="ts">
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import axios from 'axios';
	import { onMount } from 'svelte';
	import ResourceCard from '../ResourceCard/ResourceCard.svelte';
	import Button from '$lib/components/Button.svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';

	type Resource = {
		s: 'resource';
		i: string;
		n: string;
		b?: string;
		p?: string[];
		u: string;
		d: number;
		a?: string;
		score?: number;
	};

	let { data } = $props();
	let results = $derived(
		data?.r || ([] as Resource[])
	);

	let query = $state('');
	let searching = $state(false);
	let searchTimeout: NodeJS.Timeout | null =
		$state(null);

	// Reactive statement to sync search query to localStorage
	$effect(() => {
		if (browser) {
			localStorage.setItem(
				'resource_search_query',
				query
			);
		}
	});

	onMount(() => {
		if (browser) {
			const savedQuery = localStorage.getItem(
				'resource_search_query'
			);
			if (savedQuery) {
				query = savedQuery;
				search();
			}
		}
	});

	async function search(_?: any) {
		searching = true;

		// Clear previous timeout
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		searchTimeout = setTimeout(async () => {
			try {
				const payload: Record<string, unknown> = {
					q: query.trim() || undefined,
					limit: 50
				};

				const response = await axios.post(
					'/resource_name',
					payload
				);
				results = response.data as Resource[];
			} catch (error) {
				console.error('Search error:', error);
				results = [];
			} finally {
				searching = false;
			}
		}, 300);
	}

	function clearSearch() {
		query = '';
	}
</script>

<svelte:head>
	<title>search resources - apexlinks</title>
	<meta name="description" content="Find resources" />
</svelte:head>

<div
	class="resource-page from-background to-surface min-h-screen bg-gradient-to-br"
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
							class="fa-solid fa-folder text-[1.5em] text-white"
						></i>
						Search Resources
					</h1>
					<p class="text-white/80">Find resources</p>
				</div>
				{#if $page.data.user}
					<Button
						href="/~/resource_name/create"
						text="Create Resource"
						icon="fa-plus"
					/>
				{/if}
			</div>
		</div>
	</div>

	<!-- Search Form -->
	<div class="mx-auto max-w-4xl px-4 py-8">
		<div class="mb-8 rounded-lg p-6 shadow-lg">
			<div
				class="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
			>
				<!-- Search Query -->
				<div class="md:col-span-2">
					<label
						for="query"
						class="text-theme-4 mb-2 block text-sm font-medium"
					>
						Search
					</label>
					<div class="relative">
						<!-- always use DescriptionInput.svelte for all text input -->
						<DescriptionInput
							bind:value={query}
							placeholder="search for resources..."
							send={search}
							send_loading={searching}
							label=""
							voice_typing={true}
							ontranscribe={() => {}}
						/>
						{#if query}
							<button
								onclick={clearSearch}
								class="absolute top-2 right-2 z-10 rounded border-t border-r [border-color:var(--color-theme-1)] text-gray-400 hover:text-gray-600"
								aria-label="Clear search"
							>
								<svg
									width="20"
									height="20"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden="true"
								>
									<path
										d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
									/>
								</svg>
							</button>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<!-- Results -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2
					class="text-xl font-semibold [color:var(--color-theme-4)]"
				>
					{$page.data.user
						? 'suggested resources'
						: 'most recent resources'}
					{#if !searching}({results.length}){/if}
				</h2>
			</div>

			<div class="space-y-3">
				{#each results as resource (resource.i)}
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
		</div>
	</div>
</div>
