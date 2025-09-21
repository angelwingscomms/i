<script lang="ts">
	import GenderSelection from './GenderSelection.svelte';
	import AgeRange from './AgeRange.svelte';
	import ModeSelection from './ModeSelection.svelte';
	import Select from '$lib/components/Select.svelte';
	import DescriptionInput from './DescriptionInput.svelte';
	import { page } from '$app/state';
	import axios from 'axios';
	import SortDropdown from './SortDropdown.svelte';

	let {
		gender = $bindable(),
		minAge = $bindable(),
		maxAge = $bindable(), // This will be the prop passed to parent
		mode = $bindable('profile'),
		description = $bindable(),
		loading = $bindable(),
		search = $bindable(),
		sort = $bindable(),
		showAdvanced = $bindable(true),
		user_age = $bindable(0),
		sort_open = $bindable(),
		lock_more = $bindable(false),
		onClickOutside = $bindable(undefined)
	}: {
		gender: number | undefined;
		minAge: number | undefined; // Make them optional
		maxAge: number | undefined; // Make them optional
		showAdvanced?: boolean;
		mode?: 'profile' | 'custom';
		user_age?: number;
		description: string;
		loading: boolean;
		search: () => Promise<void>;
		sort: 'match' | 'age';
		sort_open?: boolean;
		sort_ref?: HTMLDivElement | null;
		onClickOutside?: () => void;
		lock_more?: boolean;
	} = $props();

	let onlineOnly = $state(false);
	let inCallOnly = $state(false);

	// New state for age filtering
	let filter_by_age = $state(false);
	let _minAge = $state(0); // Local state for AgeRange component
	let _maxAge = $state(144); // Local state for AgeRange component

	$effect(() => {
		if (filter_by_age) {
			minAge = _minAge;
			maxAge = _maxAge;
		} else {
			minAge = undefined;
			maxAge = undefined;
		}
	});
</script>

<div
	class="search-filters mx-auto max-w-4xl px-4 pb-8"
>
	<div
		class="rounded-3xl p-8 sm:p-6"
		style=" border: 3px solid var(--color-theme-6);"
	>
		<div
			class="flex flex-wrap items-center gap-6 sm:flex-col sm:items-stretch"
		>
			{#if !lock_more}
				<button
					class="text-secondary flex items-center gap-2 text-sm font-medium"
					onclick={() =>
						(showAdvanced = !showAdvanced)}
				>
					<svg
						class="transform transition-transform {showAdvanced
							? 'rotate-180'
							: ''}"
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<path
							d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
						/>
					</svg>
					more filters
				</button>
			{/if}

			{#if showAdvanced}
				<GenderSelection
					onchange={(gender) => {
						axios.post('/edit_user', { gender });
					}}
					head="Your Gender"
				/>
				<GenderSelection show_all bind:gender />
				<div class="flex-1">
					<label
						for="age"
						class="text-accent mb-3 block text-sm font-bold"
						>your age</label
					>

					<input
						id="age"
						name="age"
						type="number"
						bind:value={user_age}
						class="input-rect-center w-min rounded-full border-1"
						min="0"
						max="144"
						required
					/>
				</div>

				<!-- Filter by Age Toggle Switch -->
				<label class="toggle-switch-container">
					<input
						type="checkbox"
						class="toggle-switch-input"
						bind:checked={filter_by_age}
					/>
					<div
						class="toggle-switch-track"
						class:toggle-switch-track-checked={filter_by_age}
					>
						<div
							class="toggle-switch-thumb"
							class:toggle-switch-thumb-checked={filter_by_age}
						></div>
					</div>
					<span
						class="text-secondary ml-3 cursor-pointer text-sm font-medium"
						>Filter by Age ({filter_by_age
							? 'on'
							: 'off'})</span
					>
				</label>

				{#if filter_by_age}
					<AgeRange
						bind:minAge={_minAge}
						bind:maxAge={_maxAge}
					/>
				{/if}
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
			<div class="ml-auto flex items-center gap-3">
				<SortDropdown
					bind:sort
				/>
				<button
					class="btn-primary btn-md"
					onclick={search}
					disabled={loading}
					>{loading ? 'searching…' : 'search'}</button
				>
			</div>
		</div>

		<DescriptionInput {mode} />
	</div>
</div>
