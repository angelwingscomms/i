<script lang="ts">
	import axios from 'axios';
	import ItemCard from '../ItemCard/ItemCard.svelte';

	type Item = {
		s: 'i';
		i: string;
		n: string;
		a?: string;
		q?: string;
		p?: number;
		m?: string;
		k?: 0 | 1;
		l?: number;
		g?: number;
		u: string;
		h?: string;
		x?: string[];
		c: string;
		d?: number;
		score?: number;
	};

	let { data } = $props();
	let results = data?.results || [];

	let query = '';
	let searching = false;
	let searchTimeout: NodeJS.Timeout | null = null;

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
					'/i',
					payload
				);
				results = response.data as Item[];
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
					search
				</label>
				<div class="relative">
					<input
						bind:value={query}
						placeholder="search for items..."
						class="w-full rounded-lg border border-gray-300 px-4 py-2 pr-12 focus:border-blue-500 focus:outline-none"
						onkeydown={(e) => {
							if (e.key === 'Enter') {
								search();
							}
						}}
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
				results {#if !searching}({results.length}){/if}
			</h2>
		</div>

		<div class="space-y-3">
			{#each results as item (item.i)}
				<ItemCard {item} />
			{/each}
		</div>

		{#if results.length === 0}
			<div class="rounded-lg py-12 text-center">
				<div class="mb-2 text-lg text-gray-500">
					No items found
				</div>
				<p class="text-sm text-gray-400">
					Try adjusting your search terms or filters
				</p>
			</div>
		{/if}
	</div>
</div>
