<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	let { data, form } = $props();

	let entry = $state(data.e);
	let text = $state(entry.a || '');
	let date = $state(
		entry.d
			? new Date(entry.d).toISOString().slice(0, 10)
			: ''
	);

	const formatted_updated = $derived(
		entry.d ? new Date(entry.d).toLocaleString() : ''
	);
</script>

<svelte:head>
	<title>edit diary entry - apexlinks</title>
	<meta
		name="description"
		content="edit diary entry"
	/>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-6 px-4 py-6">
	<header class="space-y-1">
		<h1
			class="text-2xl font-semibold [color:var(--color-theme-4)]"
		>
			edit diary entry
		</h1>
		{#if formatted_updated}
			<p class="text-xs text-gray-500">
				last updated {formatted_updated}
			</p>
		{/if}
	</header>

	<form method="post" use:enhance class="space-y-4">
		<div>
			<label
				class="mb-2 block text-sm font-semibold [color:var(--color-theme-4)]"
			>
				date
			</label>
			<input
				name="date"
				type="date"
				bind:value={date}
				class="w-full rounded border border-[var(--color-theme-6)] bg-transparent px-3 py-2 text-sm text-[var(--color-theme-4)]"
			/>
		</div>

		<div>
			<label
				class="mb-2 block text-sm font-semibold [color:var(--color-theme-4)]"
			>
				entry
			</label>
			<textarea
				name="text"
				rows={12}
				bind:value={text}
				class="w-full rounded border border-[var(--color-theme-6)] bg-transparent px-3 py-3 text-sm text-[var(--color-theme-4)]"
			/>
		</div>

		<div class="flex items-center gap-3">
			<button
				type="submit"
				class="rounded bg-[var(--color-theme-1)] px-4 py-2 text-sm font-semibold text-white"
			>
				save
			</button>
			<a
				href="/~/diary"
				class="text-sm text-[var(--color-theme-4)] hover:text-[var(--color-theme-1)]"
			>
				cancel
			</a>
		</div>
	</form>
</div>
