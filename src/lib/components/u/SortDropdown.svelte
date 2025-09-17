<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	let {
		sort = $bindable(),
		sort_open = $bindable(),
		sort_ref = $bindable()
	}: {
		sort: 'match' | 'age';
		sort_open: boolean;
		sort_ref: HTMLDivElement | null;
	} = $props();
	const dispatch = createEventDispatcher();

	function handle_sort_click(s: 'match' | 'age') {
		dispatch('sort', s);
		sort_open = false;
	}

	function handle_click_outside(event: MouseEvent) {
		if (
			sort_ref &&
			!sort_ref.contains(event.target as Node)
		) {
			dispatch('click_outside');
		}
	}
</script>

<svelte:window onclick={handle_click_outside} />

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
			class="dropdown-caret {sort_open
				? 'dropdown-caret-open'
				: ''}"
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
		<div
			role="listbox"
			class="dropdown-panel dropdown-sm animate-fade-in"
		>
			<button
				type="button"
				role="option"
				aria-selected={sort === 'match'}
				class="dropdown-item"
				onclick={() => handle_sort_click('match')}
				>match</button
			>
			<button
				type="button"
				role="option"
				aria-selected={sort === 'age'}
				class="dropdown-item"
				onclick={() => handle_sort_click('age')}
				>age</button
			>
		</div>
	{/if}
</div>
