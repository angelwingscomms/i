<script lang="ts">
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { toast } from '$lib/util/toast.svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import type { User } from '$lib/types';

	let colors = $state<string[]>([]);
	let showAI = $state(false);
	let aiDesc = $state('');
	let loading = $state(false);

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
	}

	async function editWithAI() {
		loading = true;
		try {
			const prompt = `${aiDesc.trim()}\n\nCurrent colors: ${colors.map(c => '#' + c).join(', ')}`;
			const res = await axios.post('/color', {
				d: prompt
			});
			colors = res.data.c;
			showAI = false;
			aiDesc = '';
		} catch (e: any) {
			toast.error(
				e.response?.data?.message ||
					e.message ||
					'Failed to generate colors'
			);
		} finally {
			loading = false;
		}
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
				label="color theme prompt"
				placeholder="describe the color theme you'd like"
				bind:value={aiDesc}
				editable={true}
			/>
			<Button
				onclick={editWithAI}
				{loading}
				text={loading
					? 'Generating...'
					: 'Generate Colors'}
			/>
		</div>
	{/if}
</div>

<style>
	.colors-section :global(.btn-outline) {
		border: 1px solid var(--color-theme-1);
		color: var(--color-theme-1);
	}
</style>
