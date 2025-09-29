<script lang="ts">
	import axios from 'axios';
	import { toast } from '$lib/util/toast.svelte.js';
	import DescriptionInput from './ui/DescriptionInput.svelte';
	import type { Zone } from '$lib/types/zone';
	type Props = {
		q?: string;
		zones?: any[];
		onSelect?: (zone: any) => void;
		filter?: Record<string, unknown>;
		hide_input?: boolean;
		exclude_i?: string;
		onSearch?: (q?: string) => void;
		showPrivateFilter?: boolean;
	};

	let {
		q = $bindable(),
		onSelect = undefined,
		filter = undefined,
		hide_input = false,
		exclude_i = undefined,
		onSearch = (_q?: string) => {},
		showPrivateFilter = false
	}: Props = $props();

	let showPrivate = $state(false),
		loading = $state(false),
		zones: Zone[] = $state([]);

	let inputRef: HTMLInputElement | null =
		$state(null);
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
				'/zones/search',
				body
			);
			zones = (res.data || []).filter((z: any) =>
				exclude_i ? z.i !== exclude_i : true
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
			placeholder="search for a zone"
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
				>show private zones</span
			>
		</label>
	{/if}

	{#if zones?.length}
		<ul class="grid gap-2">
			{#each zones as z (z.i)}
				<li
					class="rounded-tr-3xl rounded-br-3xl border-l border-l-[var(--color-theme-6)]"
				>
					{#if onSelect}
						<button
							class="w-full px-3 py-2 text-left hover:bg-[var(--color-theme-6)]/20"
							onclick={() => onSelect?.(z)}
						>
							<div
								class="flex items-center justify-between"
							>
								<div class="font-semibold">{z.n}</div>
								<i
									class="fas fa-plus text-[var(--muted)]"
								></i>
							</div>
						</button>
					{:else}
						<a
							class="block px-3 py-2 hover:bg-[var(--color-theme-6)]/20"
							href={`/zones/${z.i}`}
						>
							<div class="font-semibold">{z.n}</div>
						</a>
					{/if}
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-[var(--muted)]">no results</p>
	{/if}
</div>
