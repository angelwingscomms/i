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
		filter: customFilter
	} = $props<{
		items: Item[];
		value?: string | undefined;
		placeholder?: string;
		label?: string;
		filter?: (query: string, items: Item[]) => Item[];
	}>();

	let open = $state(false);
	let search = $state('');

	const defaultFilter = (query: string, items: Item[]): Item[] => {
		if (!query) return [...items].sort((a: Item, b: Item) => a.label.localeCompare(b.label));
		const fuse = new Fuse(items, {
			keys: ['label'],
			threshold: 0.3
		});
		const results = fuse.search(query);
		return results.map(r => r.item).sort((a: Item, b: Item) => a.label.localeCompare(b.label));
	};

	let filteredItems = $derived(customFilter ? customFilter(search, items) : defaultFilter(search, items));

	let displayValue = $derived(value ? items.find((i: Item) => i.value === value)?.value || '' : '');

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
		e.preventDefault()
		open = true;
	}

	function onInputClick(e: MouseEvent) {
		e.stopPropagation();
		open = true;
	}
</script>

<div
	use:outside_click
	outsideclick={() => (open = false)}
	class="combo-container w-full relative"
>
	{#if label}
		<label class="text-accent block mb-1">{label}</label>
	{/if}
	<div class="flex w-full relative">
		<DescriptionInput
			bind:value={search}
			oninput={onInput}
			onfocus={handleFocus}
			onclick={onInputClick}
			onmousedown={handleFocus}
			placeholder={placeholder}
			aria-haspopup="listbox"
			aria-expanded={open}
			buttons_below={false}
		/>
		{#if open}
			<svg
				class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
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
			class="combo-panel absolute z-50 w-full mt-1 bg-transparent border border-gray-300 rounded-md shadow-lg animate-fade-in max-h-60 overflow-auto"
		>
			{#each filteredItems as item}
				<button
					type="button"
					role="option"
					aria-selected={value === item.value}
					class="combo-item w-full text-left px-4 py-2 hover:bg-gray-100/50 flex items-center {value === item.value ? 'bg-gray-100/50' : ''}"
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
		<div class="combo-panel absolute z-50 w-full mt-1 bg-transparent border border-gray-300 rounded-md shadow-lg animate-fade-in p-2 text-gray-500">
			No matching items
		</div>
	{/if}
</div>

<style>
	.animate-fade-in {
		animation: fadeIn 0.2s ease-in;
	}
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(-10px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>