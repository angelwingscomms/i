<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let search_value = data.q;
	let search_timeout: ReturnType<typeof setTimeout> | undefined;

	function on_search_input() {
		if (search_timeout) clearTimeout(search_timeout);
		search_timeout = setTimeout(() => {
			const target = search_value
				? `?q=${encodeURIComponent(search_value)}`
				: '';
			goto(`/~/worlds${target}`);
		}, 300);
	}

	function to_create_world() {
		goto('/~/worlds/create');
	}
</script>

<svelte:head>
	<title>worlds</title>
</svelte:head>

<div class="mx-auto w-full max-w-3xl px-4 py-8">
	<div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<h1 class="text-2xl font-semibold text-[var(--color-theme-4)]">
			worlds
		</h1>
		{#if $page.data.user}
			<button
				onclick={to_create_world}
				type="button"
				class="rounded-full border border-[var(--border-primary)] px-5 py-2 text-sm font-medium text-[var(--color-theme-4)] transition hover:border-[var(--color-theme-1)] hover:text-[var(--color-theme-1)]"
			>
				create world
			</button>
		{/if}
	</div>

	<div class="mb-6">
		<DescriptionInput
			id="world-search"
			name="q"
			bind:value={search_value}
			placeholder="search worlds"
			voice_typing={false}
			buttons_below={false}
			oninput={on_search_input}
		/>
	</div>

	{#if data.w.length > 0}
		<ul class="space-y-4">
			{#each data.w as world (world.i)}
				<li class="rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-5 transition hover:border-[var(--color-theme-1)]">
					<a
						href={`/worlds/${world.i}`}
						class="block"
					>
						<div class="mb-2 flex items-center justify-between gap-3">
							<p class="text-lg font-medium text-[var(--color-theme-4)]">
								{world.n}
							</p>
							{#if world.d}
								<span class="text-xs text-[var(--text-secondary)]">
									{new Date(world.d).toLocaleDateString()}
								</span>
							{/if}
						</div>
						{#if world.a}
							<p class="text-sm text-[var(--text-secondary)]">
								{world.a}
							</p>
						{/if}
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<div class="rounded-3xl border border-dashed border-[var(--border-primary)] bg-[var(--bg-card)] px-6 py-12 text-center text-sm text-[var(--text-secondary)]">
			no worlds yet
		</div>
	{/if}
</div>
