<script lang="ts">
	import Fuse from 'fuse.js';
	import { outside_click } from '$lib/util/outside_click';
	import DescriptionInput from './ui/DescriptionInput.svelte';

	type Item = {
		value: string;
		label: string;
		icon?: string;
	};

	let {
		items,
		value = $bindable<string | undefined>(),
		placeholder = 'Select...',
		label = '',
		filter: customFilter,
		mic = true
	} = $props<{
		items: Item[];
		value?: string | undefined;
		placeholder?: string;
		label?: string;
		filter?: (query: string, items: Item[]) => Item[];
		mic?: boolean;
	}>();

	let open = $state(false);
	let search = $state('');

	const defaultFilter = (
		query: string,
		items: Item[]
	): Item[] => {
		if (!query)
			return [...items].sort((a: Item, b: Item) =>
				a.label.localeCompare(b.label)
			);
		const fuse = new Fuse(items, {
			keys: ['label'],
			threshold: 0.3
		});
		const results = fuse.search(query);
		return results
			.map((r) => r.item)
			.sort((a: Item, b: Item) =>
				a.label.localeCompare(b.label)
			);
	};

	let filteredItems = $derived(
		customFilter
			? customFilter(search, items)
			: defaultFilter(search, items)
	);

	let displayValue = $derived(
		value
			? items.find((i: Item) => i.value === value)
					?.value || ''
			: ''
	);

	$effect(() => {
		search = displayValue;
	});

	$effect(() => {
		if (search && !open) {
			open = true;
		}
	});

	function handleSelect(v: string) {
		value = v;
		search = v;
		open = false;
	}

	function onInput(e: Event) {
		search = (e.target as HTMLInputElement).value;
		open = true;
	}

	function handleFocus(e: FocusEvent) {
		e.preventDefault();
		open = true;
	}

	function onInputClick(e: MouseEvent) {
		e.stopPropagation();
		open = true;
	}
</script>

<div
	use:outside_click={() => (open = false)}
	class="combo-container relative w-full"
>
	{#if label}
		<label class="text-accent mb-1 block"
			>{label}</label
		>
	{/if}
	<div class="relative flex w-full">
		<DescriptionInput
			bind:value={search}
			oninput={onInput}
			onfocus={handleFocus}
			onclick={onInputClick}
			onmousedown={handleFocus}
			{placeholder}
			aria-haspopup="listbox"
			aria-expanded={open}
			buttons_below={false}
			voice_typing={mic}
		/>
		{#if open}
			<svg
				class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 transform text-gray-400"
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
		{/if}
	</div>
	{#if open && filteredItems.length > 0}
		<div
			role="listbox"
			class="combo-panel animate-fade-in pointer-events-auto absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-none border border-gray-300 bg-white/80 shadow-lg backdrop-blur-sm"
		>
			{#each filteredItems as item}
				<button
					type="button"
					role="option"
					aria-selected={value === item.value}
					class="combo-item flex w-full items-center px-4 py-2 text-left hover:bg-gray-100/50 {value ===
					item.value
						? 'bg-gray-100/50'
						: ''}"
					onclick={() => handleSelect(item.value)}
				>
					{#if item.icon}
						<i class="fas {item.icon} mr-2"></i>
					{/if}
					{item.label}
				</button>
			{/each}
		</div>
	{:else if open && search && filteredItems.length === 0}
		<div
			class="combo-panel animate-fade-in pointer-events-auto absolute z-50 mt-1 w-full rounded-none border border-gray-300 bg-white/80 p-2 text-gray-500 shadow-lg backdrop-blur-sm"
		>
			No matching items
		</div>
	{/if}
</div>

<style>
	.animate-fade-in {
		animation: fadeIn 0.2s ease-in;
	}
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
