<script lang="ts">
	import { outside_click } from '$lib/util/outside_click';

	let {
		sort = $bindable()
	}: {
		sort: 'match' | 'age';
	} = $props();

	let sort_open = $state(false);

	function handle_sort_click(s: 'match' | 'age') {
		sort = s;
		sort_open = false;
	}
</script>

<div
	class="dropdown-container"
	use:outside_click
	outside_click={() => (sort_open = false)}
>
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
