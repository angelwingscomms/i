<script lang="ts">
	import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import axios from 'axios';
	import { onMount } from 'svelte'; // Import onMount

	export let data: PageData;

	type Result = { i: string; t: string; a?: number; g?: number; av?: string; score?: number };

	let gender: number | undefined = undefined;
	let minAge = 18;
	let maxAge = 99;
	let mode: 'profile' | 'custom' = data?.user ? 'profile' : 'custom';
	let description = '';
	let loading = false;
	let results: Result[] = [];
	let sort: 'match' | 'age' = 'match';

	let sort_open = false;
	let sort_ref: HTMLDivElement | null = null;

	function apply_sort(s: 'match' | 'age') {
		sort = s;
		sort_open = false;
		results = results.slice().sort((a, b) =>
			sort === 'match' ? (b.score ?? 0) - (a.score ?? 0) : (a.a ?? 0) - (b.a ?? 0)
		);
	}

	function handle_click_outside(event: MouseEvent) {
		if (sort_ref && !sort_ref.contains(event.target as Node)) {
			sort_open = false;
		}
	}

	// Reactive statement to sync search query to localStorage
	$: if (browser) {
		localStorage.setItem(
			'user_search_query',
			JSON.stringify({ gender, minAge, maxAge, mode, description, sort })
		);
	}

	onMount(() => {
		if (browser) {
			const savedQuery = localStorage.getItem('user_search_query');
			if (savedQuery) {
				const { g, n, x, m, d, s } = JSON.parse(savedQuery);
				gender = g;
				minAge = n;
				maxAge = x;
				mode = m;
				description = d;
				sort = s;
				search(); // Trigger search with loaded query
			} else {
				// If no saved query, fetch most recently joined users.
				// This will require a change in +page.server.ts or a new API.
				// For now, I'll just call search() with default parameters.
				search();
			}
		}
	});

	function matchPercent(score?: number) {
		if (typeof score !== 'number') return null;
		const pct = Math.max(0, Math.min(1, score)) * 100;
		return Math.round(pct);
	}

	function badgeColor(p: number | null | undefined) {
		if (p === null || p === undefined) return 'bg-gray-400';
		if (p >= 75) return 'bg-emerald-500';
		if (p >= 45) return 'bg-yellow-500';
		return 'bg-rose-500';
	}

	async function search() {
		if (minAge > maxAge) return;
		loading = true;
		try {
			const payload: Record<string, unknown> = { g: gender ?? null, n: minAge, x: maxAge };
			if (mode === 'custom' || !data?.user) {
				if (description?.trim()) payload.d = description.trim();
			}
			const arr = (await axios.post('/u', payload)).data as Result[];
			results = arr.sort((a, b) =>
				sort === 'match' ? (b.score ?? 0) - (a.score ?? 0) : (a.a ?? 0) - (b.a ?? 0)
			);
		} finally {
			loading = false;
		}
	}
</script>

<svelte:window on:click={handle_click_outside} />


<div class="container-main py-8">
	<h1 class="hero-title mb-4 text-center">search users</h1>


	<!-- filter bar -->
	<div class="card-normal mb-6">
		<div class="flex flex-wrap items-center gap-3">
			<div class="choice-group">
				<label
					><input type="radio" class="sr-only" bind:group={gender} value={undefined} />
					<div class={gender == null ? 'choice-btn-active' : 'choice-btn-inactive'}>any</div></label
				>
				<label
					><input type="radio" class="sr-only" bind:group={gender} value={0} />
					<div class={gender === 0 ? 'choice-btn-active-blue' : 'choice-btn-inactive'}>
						male
					</div></label
				>
				<label
					><input type="radio" class="sr-only" bind:group={gender} value={1} />
					<div class={gender === 1 ? 'choice-btn-active' : 'choice-btn-inactive'}>
						female
					</div></label
				>
			</div>

			<div class="age-range-container ml-auto">
				<div class="flex items-center gap-2">
					<span class="text-sm text-[var(--text-tertiary)]">{minAge}</span>
					<input
						type="range"
						min="13"
						max="99"
						bind:value={minAge}
						on:input={() => {
							if (minAge > maxAge) maxAge = minAge;
						}}
					/>
				</div>
				<div class="age-divider"></div>
				<div class="flex items-center gap-2">
					<input
						type="range"
						min="13"
						max="99"
						bind:value={maxAge}
						on:input={() => {
							if (maxAge < minAge) minAge = maxAge;
						}}
					/>
					<span class="text-sm text-[var(--text-tertiary)]">{maxAge}</span>
				</div>
			</div>

			{#if data?.user}
				<div class="choice-group">
					<button
						class={mode === 'profile' ? 'choice-btn-active' : 'choice-btn-inactive'}
						on:click={() => (mode = 'profile')}>profile</button
					>
					<button
						class={mode === 'custom' ? 'choice-btn-active' : 'choice-btn-inactive'}
						on:click={() => (mode = 'custom')}>custom</button
					>
				</div>
			{/if}

			<div class="ml-auto flex items-center gap-3">
				<div class="dropdown-container" bind:this={sort_ref}>
					<button type="button" class="dropdown-trigger" on:click={() => (sort_open = !sort_open)} aria-haspopup="listbox" aria-expanded={sort_open} aria-label="sort options">
						<span class="text-secondary">sort:</span>
						<span class="text-primary">{sort}</span>
						<svg class="dropdown-caret {sort_open ? 'dropdown-caret-open' : ''}" width="10" height="6" viewBox="0 0 10 6" fill="currentColor" aria-hidden="true">
							<path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					</button>
					{#if sort_open}
						<div role="listbox" class="dropdown-panel dropdown-sm animate-fade-in">
							<button type="button" role="option" aria-selected={sort === 'match'} class="dropdown-item" on:click={() => apply_sort('match')}>match</button>
							<button type="button" role="option" aria-selected={sort === 'age'} class="dropdown-item" on:click={() => apply_sort('age')}>age</button>
						</div>
					{/if}
				</div>
				<button class="btn-primary btn-md" on:click={search} disabled={loading}
					>{loading ? 'searching…' : 'search'}</button
				>
			</div>
		</div>

		{#if !data?.user || mode === 'custom'}
			<div class="mt-3">
				<input
					class="input-rect w-full"
					placeholder="add a short description to match on (optional)"
					bind:value={description}
				/>
			</div>
		{/if}
	</div>

	<!-- results grid -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each results as u (u.i)}
			{@const p = matchPercent(u.score)}
			<a class="no-underline" href={`/u/${u.i}`}>
				<div class="result-card">
					<div class="flex items-center gap-3">
						<div class="h-12 w-12 overflow-hidden rounded-full bg-gray-800">
							{#if u.av}
								<img src={u.av} alt={u.t} class="h-full w-full object-cover" />
							{:else}
								<div class="flex h-full w-full items-center justify-center text-xs text-gray-400">
									no pic
								</div>
							{/if}
						</div>
						<div class="flex-1">
							<div class="result-title">{u.t}</div>
							<div class="result-meta text-sm">
								<span>{u.a ?? '?'} yrs</span>
								<span>· {u.g === 0 ? 'male' : u.g === 1 ? 'female' : '?'}</span>
							</div>
						</div>
						<div class={`rounded-full px-2 py-1 text-xs font-semibold text-white ${badgeColor(p)}`}>
							{p === null ? '—' : `${p}%`}
						</div>
					</div>
				</div>
			</a>
		{/each}
	</div>
</div>
