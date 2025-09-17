<script lang="ts">
	import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import axios from 'axios';
	import { onMount } from 'svelte';
	import {
		animate,
		createTimeline,
		stagger
	} from 'animejs';

	import PageHeader from '$lib/components/u/PageHeader.svelte';
	import SearchFilters from '$lib/components/u/SearchFilters.svelte';
	import ResultsList from '$lib/components/u/ResultsList.svelte';
	import NoResultsState from '$lib/components/u/NoResultsState.svelte';

	let { user }: PageData = $props();

	type Result = {
		i: string;
		t: string;
		a?: number;
		g?: number;
		av?: string;
		score?: number;
	};

	let gender = $state<number | undefined>(undefined);
	let minAge = $state(0);
	let maxAge = $state(144);
	let mode = $state<'profile' | 'custom'>(
		user ? 'profile' : 'custom'
	);
	let description = $state('');
	let loading = $state(false);
	let results = $state<Result[]>([]);
	let sort = $state<'match' | 'age'>('match');

	let sort_open = $state(false);
	let sort_ref = $state<HTMLDivElement | null>(null);
	let onlineOnly = $state(false);
	let inCallOnly = $state(false);

	function apply_sort(s: 'match' | 'age') {
		sort = s;
		sort_open = false;
		results = results
			.slice()
			.sort((a, b) =>
				sort === 'match'
					? (b.score ?? 0) - (a.score ?? 0)
					: (a.a ?? 0) - (b.a ?? 0)
			);
	}

	function handle_click_outside() {
		sort_open = false;
	}

	// Reactive statement to sync search query to localStorage
	$effect(() => {
		if (browser) {
			localStorage.setItem(
				'user_search_query',
				JSON.stringify({
					gender,
					minAge,
					maxAge,
					mode,
					description,
					sort
				})
			);
		}
	});

	onMount(() => {
		if (browser) {
			const savedQuery = localStorage.getItem(
				'user_search_query'
			);
			if (savedQuery) {
				const parsed = JSON.parse(savedQuery);
				gender = parsed.g;
				minAge =
					typeof parsed.n === 'number' &&
					parsed.n >= 0 &&
					parsed.n <= 144
						? parsed.n
						: 0;
				maxAge =
					typeof parsed.x === 'number' &&
					parsed.x >= 0 &&
					parsed.x <= 144
						? parsed.x
						: 144;
				mode = parsed.m;
				description = parsed.d ?? '';
				sort = parsed.s ?? 'match';
				search(); // Trigger search with loaded query
			} else {
				// If no saved query, fetch most recently joined users.
				// This will require a change in +page.server.ts or a new API.
				// For now, I'll just call search() with default parameters.
				search();
			}
		}

		// Page entrance animations
		const timeline = createTimeline()
			.add('.page-header', {
				opacity: [0, 1],
				translateY: [50, 0],
				duration: 800
			})
			.add(
				'.search-filters',
				{
					opacity: [0, 1],
					translateY: [30, 0],
					duration: 600
				},
				'-=400'
			)
			.add(
				'.search-actions',
				{
					opacity: [0, 1],
					translateY: [20, 0],
					duration: 400
				},
				'-=200'
			);

		// Interactive hover animations
		document.addEventListener('mouseover', (e) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('user-card')) {
				animate(target, {
					scale: 1.02,
					translateY: -5,
					duration: 300,
					ease: 'outQuart'
				});
			}
		});

		document.addEventListener('mouseout', (e) => {
			const target = e.target as HTMLElement;
			if (target.classList.contains('user-card')) {
				animate(target, {
					scale: 1,
					translateY: 0,
					duration: 300,
					ease: 'outQuart'
				});
			}
		});
	});

	async function search() {
		if (minAge > maxAge) return; // TODO notify
		loading = true;
		try {
			const payload: Record<string, unknown> = {
				g: gender ?? null,
				n: minAge,
				x: maxAge,
				on: onlineOnly,
				ic: inCallOnly
			};
			if (mode === 'custom' || !user) {
				if (description?.trim())
					payload.d = description.trim();
			}
			const arr = (await axios.post('/u', payload))
				.data as Result[];
			results = arr.sort((a, b) =>
				sort === 'match'
					? (b.score ?? 0) - (a.score ?? 0)
					: (a.a ?? 0) - (b.a ?? 0)
			);
		} finally {
			loading = false;
		}
	}
</script>

<div class="min-h-screen">
	<PageHeader />

	<SearchFilters
		bind:gender
		bind:minAge
		bind:maxAge
		bind:mode
		bind:description
		bind:loading
		bind:sort
		bind:sort_open
		bind:sort_ref
		{search}
		onSort={apply_sort}
		onClickOutside={handle_click_outside}
	/>

	{#if results.length > 0}
		<ResultsList {results} />
	{:else if !loading}/
		<NoResultsState />
	{/if}
</div>
