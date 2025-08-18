<script lang="ts">
	import type { PageData } from './$types';
	import { browser } from '$app/environment';
	import axios from 'axios';
	import { onMount } from 'svelte';
	import { animate, createTimeline, stagger } from 'animejs';

	let { user }: PageData = $props();

	type Result = { i: string; t: string; a?: number; g?: number; av?: string; score?: number };

	let gender = $state<number | undefined>(undefined);
	let minAge = $state(0);
	let maxAge = $state(99);
	let mode = $state<'profile' | 'custom'>(user ? 'profile' : 'custom');
	let description = $state('');
	let loading = $state(false);
	let results = $state<Result[]>([]);
	let sort = $state<'match' | 'age'>('match');

	let sort_open = $state(false);
	let sort_ref = $state<HTMLDivElement | null>(null);

	function apply_sort(s: 'match' | 'age') {
		sort = s;
		sort_open = false;
		results = results
			.slice()
			.sort((a, b) =>
				sort === 'match' ? (b.score ?? 0) - (a.score ?? 0) : (a.a ?? 0) - (b.a ?? 0)
			);
	}

	function handle_click_outside(event: MouseEvent) {
		if (sort_ref && !sort_ref.contains(event.target as Node)) {
			sort_open = false;
		}
	}

	// Reactive statement to sync search query to localStorage
	$effect(() => {
		if (browser) {
			localStorage.setItem(
				'user_search_query',
				JSON.stringify({ gender, minAge, maxAge, mode, description, sort })
			);
		}
	});

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

	function matchPercent(score?: number) {
		if (typeof score !== 'number') return null;
		const pct = Math.max(0, Math.min(1, score)) * 100;
		return Math.round(pct);
	}

	async function search() {
		if (minAge > maxAge) return; // TODO notify
		loading = true;
		try {
			const payload: Record<string, unknown> = { g: gender ?? null, n: minAge, x: maxAge };
			if (mode === 'custom' || !user) {
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

<svelte:window onclick={handle_click_outside} />

<div class="min-h-screen">
	<!-- Page Header -->
	<div class="page-header px-4 py-16 text-center opacity-0 sm:py-12">
		<div class="mx-auto max-w-4xl">
			<h1 class="mb-6 text-6xl font-black sm:text-4xl" style="color: var(--color-theme-4);">
				Find people
			</h1>
			<p class="text-xl text-gray-600 sm:text-lg dark:text-gray-300">
				Discover people with AI-powered search
			</p>
		</div>
	</div>

	<!-- Search Filters -->
	<div class="search-filters mx-auto max-w-4xl px-4 pb-8 opacity-0">
		<div class="rounded-3xl p-8 sm:p-6" style=" border: 3px solid var(--color-theme-6);">
			<div class="flex flex-wrap items-center gap-6 sm:flex-col sm:items-stretch">
				<!-- Gender Selection -->
				<div class="flex-1">
					<fieldset>
						<legend class="mb-3 block text-sm font-bold" style="color: var(--color-theme-4);"
							>Gender Preference</legend
						>
						<div class="flex gap-2">
							<label class="flex-1">
								<input type="radio" class="sr-only" bind:group={gender} value={undefined} />
								<div
									class="cursor-pointer rounded-full px-4 py-3 text-center font-semibold transition-all {gender ==
									null
										? 'text-white'
										: 'text-gray-600 hover:bg-gray-100'}"
									style={gender == null
										? `background: transparent; border: 2px solid var(--color-theme-6);`
										: 'background: transparent; border: 2px solid var(--color-theme-6);'}
								>
									Any
								</div>
							</label>
							<label class="flex-1">
								<input type="radio" class="sr-only" bind:group={gender} value={0} />
								<div
									class="cursor-pointer rounded-full px-4 py-3 text-center font-semibold transition-all {gender ===
									0
										? 'text-white'
										: 'text-gray-600 hover:bg-gray-100'}"
									style={gender === 0
										? `background: transparent; border: 2px solid var(--color-theme-2);`
										: 'background: transparent; border: 2px solid var(--color-theme-2);'}
								>
									Male
								</div>
							</label>
							<label class="flex-1">
								<input type="radio" class="sr-only" bind:group={gender} value={1} />
								<div
									class="cursor-pointer rounded-full px-4 py-3 text-center font-semibold transition-all {gender ===
									1
										? 'text-white'
										: 'text-gray-600 hover:bg-gray-100'}"
									style={gender === 1
										? `background: transparent; border: 2px solid var(--color-theme-3);`
										: 'background: transparent; border: 2px solid var(--color-theme-3);'}
								>
									Female
								</div>
							</label>
						</div>
					</fieldset>
				</div>

				<!-- Age Range -->
				<div class="flex-1">
					<div class="mb-3 block text-sm font-bold" style="color: var(--color-theme-4);">
						Age Range
					</div>
					<div class="space-y-4">
						<div class="flex items-center gap-4">
							<span class="text-sm font-medium" style="color: var(--color-theme-1);"
								>Min: {minAge}</span
							>
							<input
								type="range"
								min="13"
								max="99"
								bind:value={minAge}
								class="flex-1 accent-[var(--color-theme-1)]"
								oninput={() => {
									if (minAge > maxAge) maxAge = minAge;
								}}
							/>
						</div>
						<div class="flex items-center gap-4">
							<span class="text-sm font-medium" style="color: var(--color-theme-2);"
								>Max: {maxAge}</span
							>
							<input
								type="range"
								min="13"
								max="99"
								bind:value={maxAge}
								class="flex-1 accent-[var(--color-theme-2)]"
								oninput={() => {
									if (maxAge < minAge) minAge = maxAge;
								}}
							/>
						</div>
					</div>
				</div>

				{#if user}
					<div class="choice-group">
						<button
							class={mode === 'profile' ? 'choice-btn-active' : 'choice-btn-inactive'}
							onclick={() => (mode = 'profile')}>profile</button
						>
						<button
							class={mode === 'custom' ? 'choice-btn-active' : 'choice-btn-inactive'}
							onclick={() => (mode = 'custom')}>custom</button
						>
					</div>
				{/if}

				<div class="ml-auto flex items-center gap-3">
					<div class="dropdown-container" bind:this={sort_ref}>
						<button
							type="button"
							class="dropdown-trigger"
							onclick={() => (sort_open = !sort_open)}
							aria-haspopup="listbox"
							aria-expanded={sort_open}
							aria-label="sort options"
						>
							<span class="text-secondary">sort:</span>
							<span class="text-primary">{sort}</span>
							<svg
								class="dropdown-caret {sort_open ? 'dropdown-caret-open' : ''}"
								width="10"
								height="6"
								viewBox="0 0 10 6"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									d="M1 1L5 5L9 1"
									stroke="currentColor"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
						</button>
						{#if sort_open}
							<div role="listbox" class="dropdown-panel dropdown-sm animate-fade-in">
								<button
									type="button"
									role="option"
									aria-selected={sort === 'match'}
									class="dropdown-item"
									onclick={() => apply_sort('match')}>match</button
								>
								<button
									type="button"
									role="option"
									aria-selected={sort === 'age'}
									class="dropdown-item"
									onclick={() => apply_sort('age')}>age</button
								>
							</div>
						{/if}
					</div>
					<button class="btn-primary btn-md" onclick={search} disabled={loading}
						>{loading ? 'searching…' : 'search'}</button
					>
				</div>
			</div>

			{#if !user || mode === 'custom'}
				<div class="mt-3">
					<input
						class="input-rect w-full"
						placeholder="add a short description to match on (optional)"
						bind:value={description}
						style="background: transparent; border: 1px solid var(--color-theme-6);"
					/>
				</div>
			{/if}
		</div>

		<!-- Results List -->
		<div class="space-y-3">
			{#each results as u (u.i)}
				{@const p = matchPercent(u.score)}
				<a class="user-card group block no-underline" href={`/u/${u.i}`}>
					<div
						class="flex items-center gap-4 rounded-2xl p-4 transition-all duration-300"
						style="background: transparent; border: 1px solid var(--color-theme-6);"
					>
						<!-- Avatar -->
						<div class="relative flex-shrink-0">
							<div
								class="h-12 w-12 overflow-hidden rounded-full"
								style="border: 1px solid var(--color-theme-6);"
							>
								{#if u.av}
									<img src={u.av} alt={u.t} class="h-full w-full object-cover" />
								{:else}
									<div
										class="flex h-full w-full items-center justify-center text-lg font-bold"
										style="background: transparent; color: var(--text-primary);"
									>
										{u.t.charAt(0).toUpperCase()}
									</div>
								{/if}
							</div>
						</div>

						<!-- User Info -->
						<div class="min-w-0 flex-1">
							<div class="flex items-center justify-between">
								<h3
									class="truncate text-lg font-bold transition-transform group-hover:scale-105"
									style="color: var(--color-theme-4);"
								>
									{u.t}
								</h3>
								{#if p !== null}
									<span
										class="ml-2 rounded-full px-2 py-1 text-xs font-bold"
										style="background: transparent; border: 1px solid {p >= 80
											? 'var(--color-theme-1)'
											: p >= 60
												? 'var(--color-theme-2)'
												: p >= 40
													? 'var(--color-theme-3)'
													: 'var(--color-theme-6)'}; color: {p >= 80
											? 'var(--color-theme-1)'
											: p >= 60
												? 'var(--color-theme-2)'
												: p >= 40
													? 'var(--color-theme-3)'
													: 'var(--color-theme-6)'};"
									>
										{p}%
									</span>
								{/if}
							</div>

							<!-- Details -->
							<div class="mt-1 flex items-center gap-3 text-sm">
								<span style="color: var(--color-theme-1);">
									{u.a ?? '?'} years
								</span>
								<span style="color: var(--color-theme-2);">
									{u.g === 0 ? 'Male' : u.g === 1 ? 'Female' : 'Other'}
								</span>
							</div>
						</div>

						<!-- Arrow -->
						<div class="flex-shrink-0">
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="currentColor"
								style="color: var(--color-theme-6);"
								class="transition-transform group-hover:translate-x-1"
							>
								<path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
							</svg>
						</div>
					</div>
				</a>
			{/each}
		</div>

		<!-- No Results State -->
		{#if !loading && results.length === 0}
			<div class="py-16 text-center">
				<div class="mb-6 text-6xl">🔍</div>
				<h3 class="mb-4 text-2xl font-bold" style="color: var(--color-theme-4);">No users found</h3>
				<p class="text-lg" style="color: var(--color-theme-6);">
					Try adjusting your search criteria
				</p>
			</div>
		{/if}
	</div>
</div>
