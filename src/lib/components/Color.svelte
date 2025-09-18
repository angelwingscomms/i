<script lang="ts">
	import { onMount } from 'svelte';
	import axios from 'axios';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import type { User } from '$lib/types';

	let colors = $state<string[]>([]);
	let showAI = $state(false);
	let aiDesc = $state('');

	onMount(async () => {
		const res = await axios.get('/color');
		colors = res.data || [];
	});

	$effect(() => {
		if (colors.length > 0 && colors.length <= 20) {
			axios.put('/color', { c: colors });
		}
	});

	function removeColor(index: number) {
		colors = colors.filter((_, i) => i !== index);
	}

	function addColor() {
		if (colors.length === 0) {
			colors = ['#ff0000']; // Default red
			return;
		}
		const last = colors[colors.length - 1];
		const r =
			(parseInt(last.slice(0, 2), 16) + 10) % 256;
		const g =
			(parseInt(last.slice(2, 4), 16) + 5) % 256;
		const b =
			(parseInt(last.slice(4, 6), 16) + 15) % 256;
		const newHex =
			r.toString(16).padStart(2, '0') +
			g.toString(16).padStart(2, '0') +
			b.toString(16).padStart(2, '0');
		colors = [...colors, newHex];
		if (onUpdate) onUpdate(colors);
	}

	async function editWithAI() {
		const res = await axios.post('/color', {
			d: aiDesc
		});
		colors = res.data.c;
		showAI = false;
		aiDesc = '';
	}
</script>

<div class="colors-section">
	<h3 class="mb-4 text-lg font-semibold">
		Your Colors
	</h3>
	<div class="mb-4 flex flex-wrap items-center gap-2">
		{#each colors as color, index}
			<div class="relative">
				<div
					class="h-12 w-12 rounded-full border-2 border-gray-300"
					style="background-color: #{color}"
				></div>
				<button
					onclick={() => removeColor(index)}
					class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border bg-white text-xs"
					style="border-color: #{color}"
				>
					×
				</button>
			</div>
		{/each}
		<button
			onclick={addColor}
			class="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg"
			>+</button
		>
	</div>
	<button
		onclick={() => (showAI = !showAI)}
		class="btn-outline rounded-full px-4 py-2"
	>
		{showAI ? 'Cancel' : 'Edit with AI'}
	</button>
	{#if showAI}
		<div class="mt-4 rounded-lg border p-4">
			<DescriptionInput
				bind:value={aiDesc}
				editable={true}
			/>
			<button
				onclick={editWithAI}
				class="btn-primary mt-2 rounded-full px-4 py-2"
				>Generate Colors</button
			>
		</div>
	{/if}
</div>
","file_path">/home/x/z/angelwingscomms/i/src/lib/components/Color.svelte

<style>
	.colors-section :global(.btn-outline) {
		border: 1px solid var(--color-theme-1);
		color: var(--color-theme-1);
	}
</style>
