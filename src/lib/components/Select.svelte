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
		options: {
			value: string;
			label: string;
			icon?: string;
		}[];
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
</script>

<div
	use:outside_click
	outside_click={() => (open = false)}
	class="dropdown-container w-full"
	bind:this={sort_ref}
>
	<button
		type="button"
		class="dropdown-trigger w-full justify-between border-t-0 border-r-0 border-b-0"
		onclick={() => (open = !open)}
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-label="select option"
	>
		{#if label}<span class="text-secondary"
				>{label}</span
			>{/if}
		<span class="text-primary flex items-center">
			{#if value}
				{@const selected = options.find(
					(o: typeof value) => o.value === value
				)}
				{#if selected}
					{#if selected.icon}
						<i class="fas {selected.icon} mr-2"></i>
					{/if}
					{selected.label}
				{:else}
					{placeholder}
				{/if}
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
					class="dropdown-item flex items-center"
					onclick={() => handle_select(opt.value)}
				>
					{#if opt.icon}
						<i class="fas {opt.icon} mr-2"></i>
					{/if}
					{opt.label}
				</button>
			{/each}
		</div>
	{/if}
</div>
