<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let options: { value: string; label: string }[];
	export let value: string;
	let open = $bindable(false);
	let placeholder = 'Select...';
	let sort_ref = $bindable<HTMLDivElement | null>(null);

	const dispatch = createEventDispatcher();

	function handle_select(v: string) {
		value = v;
		open = false;
		dispatch('change', { value: v });
	}

	function handle_click_outside(event: MouseEvent) {
		if (sort_ref && !sort_ref.contains(event.target as Node)) {
			open = false;
			dispatch('close');
		}
	}
</script>

<svelte:window onclick={handle_click_outside} />

<div class="dropdown-container" bind:this={sort_ref}>
	<button
		type="button"
		class="dropdown-trigger"
		onclick={() => open = !open}
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-label="select option"
	>
		<span class="text-secondary">sort:</span>
		<span class="text-primary">
			{#if value}
				{@const selected = options.find(o => o.value === value)}
				{selected ? selected.label : placeholder}
			{:else}
				{placeholder}
			{/if}
		</span>
		<svg
			class="dropdown-caret {open ? 'dropdown-caret-open' : ''}"
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
	{#if open}
		<div
			role="listbox"
			class="dropdown-panel dropdown-sm animate-fade-in"
		>
			{#each options as opt}
				<button
					type="button"
					role="option"
					aria-selected={value === opt.value}
					class="dropdown-item"
					onclick={() => handle_select(opt.value)}
				>
					{opt.label}
				</button>
			{/each}
		</div>
	{/if}
</div>