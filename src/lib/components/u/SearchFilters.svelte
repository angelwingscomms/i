<script lang="ts">
	import GenderSelection from './GenderSelection.svelte';
	import AgeRange from './AgeRange.svelte';
	import ModeSelection from './ModeSelection.svelte';
	import SortDropdown from './SortDropdown.svelte';
	import DescriptionInput from './DescriptionInput.svelte';
	import { page } from '$app/state';
	import axios from 'axios';

	let {
		gender = $bindable(),
		minAge = $bindable(),
		maxAge = $bindable(),
		mode = $bindable('profile'),
		description = $bindable(),
		loading = $bindable(),
		search = $bindable(),
		sort = $bindable(),
		showAdvanced = $bindable(true),
		user_age = $bindable(),
		sort_open = $bindable(),
		lock_more = $bindable(false),
		sort_ref = $bindable(undefined),
		onSort = $bindable(undefined),
		onClickOutside = $bindable(undefined)
	}: {
		gender: number | undefined;
		minAge: number;
		maxAge: number;
		showAdvanced?: boolean;
		mode?: 'profile' | 'custom';
		user_age?: number,
		description: string;
		loading: boolean;
		search: () => Promise<void>;
		sort: 'match' | 'age';
		sort_open: boolean;
		sort_ref?: HTMLDivElement | null;
		onSort?: (s: 'match' | 'age') => void;
		onClickOutside?: () => void;
		lock_more?: boolean;
	} = $props();

	let onlineOnly = $state(false);
	let inCallOnly = $state(false);
</script>

<div class="search-filters mx-auto max-w-4xl px-4 pb-8">
	<div class="rounded-3xl p-8 sm:p-6" style=" border: 3px solid var(--color-theme-6);">
		<div class="flex flex-wrap items-center gap-6 sm:flex-col sm:items-stretch">
			{#if !lock_more}
				<button
					class="flex items-center gap-2 text-sm font-medium"
					onclick={() => (showAdvanced = !showAdvanced)}
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
			{/if}

			{#if showAdvanced}
				<GenderSelection
					onchange={(gender) => {
						axios.put('/edit_user', { gender });
					}}
					head="Your Gender"
				/>
				<GenderSelection show_all bind:gender />
				<div class="flex-1">
						<label for="age" class="mb-3 block text-sm font-bold" style="color: var(--color-theme-4);">your age (optional)</label>

					<input
						id="age"
						name="age"
						type="number"
						bind:value={user_age}
						class="rounded-full input-rect w-min border-1"
						min="0"
						max="144"
						required
					/>
				</div>
				<AgeRange bind:minAge bind:maxAge />
			{/if}

			<!-- <div class="row items-center gap-4">
				<label class="inline-flex items-center gap-2"
					><input type="checkbox" bind:checked={onlineOnly} /> online only</label
				>
				<label class="inline-flex items-center gap-2"
					><input type="checkbox" bind:checked={inCallOnly} /> in call</label
				>
			</div> -->

			<!-- <ModeSelection bind:mode /> -->

			<!-- TODO-PUTBACK -->
			<!-- <div class="ml-auto flex items-center gap-3">
				<SortDropdown
					bind:sort
					bind:sort_open
					bind:sort_ref
					on:sort={(e) => onSort(e.detail)}
					onclick_outside={onClickOutside}
				/>
				<button class="btn-primary btn-md" onclick={search} disabled={loading}
					>{loading ? 'searching…' : 'search'}</button
				>
			</div> -->
		</div>

		<DescriptionInput {mode} />
	</div>
</div>
