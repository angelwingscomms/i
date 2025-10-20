<script lang="ts">
	import { browser } from '$app/environment';
	import axios from 'axios';
	import { onMount } from 'svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import { ZoneCard } from '$lib/components/zone';

	type Zone = {
		i: string;
		n?: string;
		l?: number;
		g?: number;
	p?: string;
		u?: string;
		d?: number;
		c?: string[];
	};

type Props = {
		q?: string;
		zones?: Zone[];
		loading?: boolean;
		initial_zones?: Zone[];
		onSelect?: (zone: Zone) => void;
		filter?: Record<string, unknown>;
		hide_input?: boolean;
		exclude_i?: string;
		onSearch?: (zones: Zone[]) => void;
		source?: 'db' | 'osm';
		hide_coords?: boolean;
	debounce?: number;
	};

let {
	q = $bindable(''),
	zones = $bindable([] as Zone[]),
	loading = $bindable(false),
	initial_zones = [],
	onSelect = undefined,
	filter = undefined,
	hide_input = false,
	exclude_i = undefined,
	onSearch = (_zones: Zone[]) => {},
	source = 'db',
	hide_coords = false,
	debounce = 300
}: Props = $props();

	let searchTimeout: NodeJS.Timeout | null =
		$state(null);
	const storageKey = source === 'osm'
		? 'zone_search_query_osm'
		: 'zone_search_query';
	let savedInitial = $state(initial_zones);
	let show_results = $state(initial_zones.length > 0);

	$effect(() => {
		savedInitial = initial_zones;
		if (
			!q.trim() &&
			initial_zones.length &&
			!zones.length
		) {
			zones = initial_zones;
			show_results = true;
		}
	});

	$effect(() => {
		if (!browser) return;
		localStorage.setItem(storageKey, q);
	});

	onMount(() => {
		if (!browser) {
			if (!zones.length && savedInitial.length) {
				zones = savedInitial;
			}
			return;
		}
		const savedQuery =
			localStorage.getItem(storageKey);
		if (savedQuery) {
			q = savedQuery;
			search();
		} else if (savedInitial.length) {
			zones = savedInitial;
			show_results = true;
		}
	});

	async function search() {
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}
		loading = true;
		show_results = true;

		searchTimeout = setTimeout(async () => {
			try {
				const payload: Record<string, unknown> = {
					q: q.trim() || undefined,
					source
				};
				if (filter) {
					for (const [key, value] of Object.entries(
						filter
					)) {
						if (
							value !== undefined &&
							value !== null &&
							value !== ''
						) {
							payload[key] = value;
						}
					}
				}
				const response = await axios.post(
					'/zones/search',
					payload
				);
				const list = (response.data || []) as Zone[];
				zones = list.filter((zone) =>
					exclude_i ? zone.i !== exclude_i : true
				);
				onSearch(zones);
			} catch (error) {
				console.error('zone search error:', error);
				zones = [];
				onSearch([]);
			} finally {
				loading = false;
				searchTimeout = null;
			}
		}, debounce);
	}

	function clearSearch() {
		q = '';
		zones = savedInitial;
		onSearch(zones);
		loading = false;
		show_results = savedInitial.length > 0;
		if (searchTimeout) {
			clearTimeout(searchTimeout);
			searchTimeout = null;
		}
	}

	function formatCoord(value?: number) {
		if (typeof value !== 'number') return 'n/a';
		return value.toFixed(5);
	}
</script>

<div class="grid gap-6">
	{#if !hide_input}
		<div class="relative">
			<DescriptionInput
				bind:value={q}
				placeholder="search for zones..."
				send={search}
				send_loading={loading}
				label=""
				voice_typing={true}
				ontranscribe={() => {}}
			/>
			{#if q}
				<button
					type="button"
					onclick={clearSearch}
					class="absolute top-3 right-3 rounded-full border border-[var(--color-theme-1)] p-1 text-[var(--color-theme-3)] transition-colors hover:text-[var(--color-theme-1)]"
					aria-label="clear search"
				>
					<svg
						width="16"
						height="16"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="h-4 w-4"
					>
						<path
							d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
						/>
					</svg>
				</button>
			{/if}
		</div>
	{/if}

	{#if loading}
		<div
			class="rounded-lg border border-dashed border-[var(--color-theme-6)] py-10 text-center text-sm text-[var(--color-theme-3)]"
		>
			searching...
		</div>
	{:else if show_results && zones?.length}
		<div class="space-y-3">
			{#each zones as zone (zone.i)}
				{#if onSelect}
					<button
					type="button"
					onclick={() => {
						show_results = false;
						onSelect?.(zone);
					}}
					class="block w-full text-left"
					>
						<div
							class="rounded-3xl border-l border-[var(--color-theme-6)] bg-transparent p-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-[var(--color-theme-1)]"
						>
							<div
								class="flex items-start justify-between gap-4"
							>
								<div class="min-w-0 flex-1">
									<h3
										class="truncate text-lg font-bold text-[var(--color-theme-4)]"
									>
										{zone.n?.trim() ||
											'untitled zone'}
									</h3>
							{#if !hide_coords}
								<div
									class="mt-2 grid gap-1 text-sm text-[var(--color-theme-3)]"
								>
									<span
										>lat: {formatCoord(
											zone.l
										)}</span
									>
									<span
										>lon: {formatCoord(
											zone.g
										)}</span
									>
								</div>
							{/if}
								</div>
								<div
									class="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-theme-6)]/10 text-sm font-semibold text-[var(--color-theme-1)]"
								>
							{zone.c?.length ?? 0}
								</div>
							</div>
							{#if zone.d}
								<p
									class="mt-3 text-xs text-[var(--color-theme-3)]"
								>
									updated {new Date(
										zone.d
									).toLocaleDateString()}
								</p>
							{/if}
						</div>
					</button>
				{:else}
					<ZoneCard {zone} />
				{/if}
			{/each}
		</div>
{:else if show_results}
		<div
			class="rounded-lg border border-dashed border-[var(--color-theme-6)] py-10 text-center text-sm text-[var(--color-theme-3)]"
		>
			no zones found
		</div>
	{/if}
</div>
