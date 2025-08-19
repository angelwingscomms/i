<script lang="ts">
	import GenderSelection from './GenderSelection.svelte';
	import AgeRange from './AgeRange.svelte';
	import ModeSelection from './ModeSelection.svelte';
	import SortDropdown from './SortDropdown.svelte';
	import DescriptionInput from './DescriptionInput.svelte';
	import { page } from '$app/stores';

	let {
		gender = $bindable(),
		minAge = $bindable(),
		maxAge = $bindable(),
		mode = $bindable(),
		description = $bindable(),
		loading = $bindable(),
		search = $bindable(),
		sort = $bindable(),
		sort_open = $bindable(),
		sort_ref = $bindable(),
		onSort = $bindable(),
		onClickOutside = $bindable()
	}: {
		gender: number | undefined;
		minAge: number;
		maxAge: number;
		mode: 'profile' | 'custom';
		description: string;
		loading: boolean;
		search: () => Promise<void>;
		sort: 'match' | 'age';
		sort_open: boolean;
		sort_ref: HTMLDivElement | null;
		onSort: (s: 'match' | 'age') => void;
		onClickOutside: () => void;
	} = $props();

	let showAdvanced = $state(false);
</script>

<div class="search-filters mx-auto max-w-4xl px-4 pb-8 opacity-0">
	<div class="rounded-3xl p-8 sm:p-6" style=" border: 3px solid var(--color-theme-6);">
		<div class="flex flex-wrap items-center gap-6 sm:flex-col sm:items-stretch">
			<button 
				class="flex items-center gap-2 text-sm font-medium" 
				onclick={() => showAdvanced = !showAdvanced}
			>
				<svg
					class="transform transition-transform {showAdvanced ? 'rotate-180' : ''}"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="currentColor"
				>
					<path d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
				</svg>
				more filters
			</button>

			{#if showAdvanced}
				<GenderSelection bind:gender />
				<AgeRange bind:minAge bind:maxAge />
			{/if}
			
			<ModeSelection bind:mode />

			<div class="ml-auto flex items-center gap-3">
				<SortDropdown bind:sort bind:sort_open bind:sort_ref on:sort={e => onSort(e.detail)} on:click_outside={onClickOutside} />
				<button class="btn-primary btn-md" onclick={search} disabled={loading}
					>{loading ? 'searching…' : 'search'}</button
				>
			</div>
		</div>

		<DescriptionInput {mode} bind:description />
	</div>
</div>