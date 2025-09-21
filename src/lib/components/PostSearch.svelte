<script lang="ts">
	import axios from 'axios';
	import { toast } from '$lib/util/toast.svelte.js';

	let {
		q = $bindable(''),
		posts = $bindable<any[]>([]),
		loading = $bindable(false),
		onSelect = undefined as undefined | ((post: any) => void),
		filter = $bindable<{ f?: string } | undefined>(undefined),
		hide_input = false,
		exclude_i = undefined as string | undefined,
		onSearch = (_q?: string) => {}
	} = $props();

	async function search() {
		loading = true;
		try {
			const body: Record<string, unknown> = { q };
			if (filter?.f) body.f = filter.f;
			const res = await axios.post('/posts/search', body);
			posts = (res.data || []).filter((p: any) =>
				exclude_i ? p.i !== exclude_i : true
			);
			onSearch(q);
		} catch (e) {
			console.error(e);
			toast.error('search failed. try again');
		} finally {
			loading = false;
		}
	}

	function on_key(e: KeyboardEvent) {
		if (e.key === 'Enter') search();
	}
</script>

<div class="grid gap-3">
	{#if !hide_input}
		<div class="flex items-center gap-2 rounded-xl border border-[var(--color-theme-6)] p-3">
			<input
				class="flex-1 bg-transparent outline-none border-b border-[var(--color-theme-6)] px-2 py-1"
				placeholder="search for a post"
				bind:value={q}
				onkeydown={on_key}
			/>
			<button
				class="btn-primary px-3 py-2 rounded"
				onclick={search}
				disabled={loading}
			>
				{#if loading}
					<i class="fas fa-spinner fa-spin"></i>
				{:else}
					<i class="fas fa-magnifying-glass"></i>
				{/if}
			</button>
		</div>
	{/if}

	{#if posts?.length}
		<ul class="grid gap-2">
			{#each posts as p (p.i)}
				<li class="rounded-lg border border-[var(--color-theme-6)]">
					{#if onSelect}
						<button class="w-full text-left px-3 py-2 hover:bg-[var(--color-theme-6)]/20" onclick={() => onSelect?.(p)}>
							<div class="flex items-center justify-between">
								<div class="font-semibold">{p.t}</div>
								<i class="fas fa-plus text-[var(--muted)]"></i>
							</div>
						</button>
					{:else}
						<a class="block px-3 py-2 hover:bg-[var(--color-theme-6)]/20" href={`/posts/${p.i}`}>
							<div class="font-semibold">{p.t}</div>
						</a>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-[var(--muted)]">no results</p>
	{/if}
</div>

