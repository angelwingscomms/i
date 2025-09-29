<script lang="ts">
	import axios from 'axios';
	import { toast } from '$lib/util/toast.svelte.js';
	import DescriptionInput from './ui/DescriptionInput.svelte';
	import Button from './Button.svelte';
	let {
		q = $bindable(''),
		posts = $bindable<any[]>([]),
		loading = $bindable(false),
		onSelect = undefined as
			| undefined
			| ((post: any) => void),
		filter = $bindable<
			Record<string, unknown> | undefined
		>(undefined),
		hide_input = false,
		exclude_i = undefined as string | undefined,
		onSearch = (_q?: string) => {},
		showPrivateFilter = $bindable(false)
	} = $props();

	let showPrivate = $state(false);

	let inputRef: HTMLInputElement | null = null;
	async function search() {
		loading = true;
		try {
			const body: Record<string, unknown> = { q };
			if (filter) {
				for (const [key, value] of Object.entries(
					filter
				)) {
					if (value !== undefined && value !== null) {
						body[key] = value;
					}
				}
			}
			if (showPrivateFilter && showPrivate)
				body.private = true;
			const res = await axios.post(
				'/posts/search',
				body
			);
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

	$effect(() => {
		if (!inputRef) return;
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Enter') {
				search();
			}
		};
		inputRef.addEventListener(
			'keydown',
			handleKeydown
		);
		return () => {
			inputRef?.removeEventListener(
				'keydown',
				handleKeydown
			);
		};
	});
</script>

<div class="grid gap-3">
	{#if !hide_input}
		<DescriptionInput
			bind:value={q}
			placeholder="search for a post"
			send={() => search()}
			send_loading={loading}
			bind:ref={inputRef}
		/>
	{/if}

	{#if showPrivateFilter}
		<label
			class="flex cursor-pointer items-center space-x-2"
		>
			<input
				type="checkbox"
				bind:checked={showPrivate}
				class="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
				onchange={() => search()}
			/>
			<span class="text-sm font-medium text-gray-700"
				>show private posts</span
			>
		</label>
	{/if}

	{#if posts?.length}
		<ul class="grid gap-2">
			{#each posts as p (p.i)}
				<li
					class="rounded-tr-3xl rounded-br-3xl border-l border-l-[var(--color-theme-6)]"
				>
					{#if onSelect}
						<button
							class="w-full px-3 py-2 text-left hover:bg-[var(--color-theme-6)]/20"
							onclick={() => onSelect?.(p)}
						>
							<div
								class="flex items-center justify-between"
							>
								<div class="font-semibold">{p.t}</div>
								<i
									class="fas fa-plus text-[var(--muted)]"
								></i>
							</div>
						</button>
					{:else}
						<a
							class="block px-3 py-2 hover:bg-[var(--color-theme-6)]/20"
							href={`/posts/${p.i}`}
						>
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
