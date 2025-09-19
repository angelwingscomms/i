<script lang="ts">
	import { outside_click } from '$lib/util/outside_click';

	let {
		options,
		value = $bindable(),
		open = false,
		placeholder = 'Select...',
		sort_ref = null as HTMLDivElement | null,
		label = '',
		onclick
	} = $props<{
		options: { value: string; label: string }[];
		value: string | undefined;
		open?: boolean;
		placeholder?: string;
		sort_ref?: HTMLDivElement | null;
		label?: string;
		onclick?: (v: string) => void;
	}>();

	function handle_select(v: string) {
		value = v;
		open = false;
		onclick?.(v);
	}

	function handle_click_outside(event: MouseEvent) {
		if (
			sort_ref &&
			!sort_ref.contains(event.target as Node)
		) {
			open = false;
		}
	}
</script>

<svelte:window onclick={handle_click_outside} />

<div
	use:outside_click
	outside_click={handle_click_outside}
	class="dropdown-container w-full"
	bind:this={sort_ref}
>
	<button
		type="button"
		class="dropdown-trigger w-full justify-between"
		onclick={() => (open = !open)}
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-label="select option"
	>
		{#if label}<span class="text-secondary">{label}</span>{/if}
		<span class="text-primary">
			{#if value}
				{@const selected = options.find(
					(o: typeof value) => o.value === value
				)}
				{selected ? selected.label : placeholder}
			{:else}
				{placeholder}
			{/if}
		</span>
		<svg
			class="dropdown-caret {open
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
	{#if open}
		<div
			role="listbox"
			class="dropdown-panel dropdown-sm animate-fade-in w-full"
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
