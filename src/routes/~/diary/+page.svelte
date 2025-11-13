<script lang="ts">
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import DiaryList from '$lib/components/diary/DiaryList.svelte';
	import DiarySearchForm from '$lib/components/diary/DiarySearchForm.svelte';
	import Button from '$lib/components/Button.svelte';
	import type { DiaryEntry } from '$lib/types';

	let { data } = $props();

	let entries = $state(
		(data.e || []) as DiaryEntry[]
	);
	let grouped = $derived(data.g);
	let available_dates = $state(data.d || []);
	let selected_date = $state<string | null>(
		data.s || null
	);
	let query = $state('');
	let searching = $state(false);
	let creating = $state(false);

	const fetch_entries = async () => {
		searching = true;
		try {
			const response = await axios.post(
				'/~/diary/search',
				{
					q: query.trim(),
					d: selected_date
				}
			);
			entries = response.data as DiaryEntry[];
		} catch (err) {
			console.error('search diary failed', err);
		} finally {
			searching = false;
		}
	};

	const create_entry = async () => {
		creating = true;
		try {
			const response = await axios.post('/~/diary', {
				d: selected_date
			});
			const { i } = response.data as { i: string };
			goto(`/~/diary/${i}/edit`);
		} catch (err) {
			console.error('create diary failed', err);
		} finally {
			creating = false;
		}
	};

	const on_date_change = (date: string | null) => {
		selected_date = date;
		fetch_entries();
	};

	const create_label = $derived(
		selected_date
			? `create new entry for ${selected_date}`
			: 'create new entry'
	);
</script>

<svelte:head>
	<title>diary - apexlinks</title>
	<meta name="description" content="diary" />
</svelte:head>

<div class="mx-auto max-w-3xl space-y-8 px-4 py-6">
	<header class="flex items-center justify-between">
		<div>
			<h1
				class="text-3xl font-semibold [color:var(--color-theme-4)]"
			>
				diary
			</h1>
			<p class="text-sm text-gray-500">
				track your thoughts
			</p>
		</div>
		<Button
			type="button"
			text={create_label}
			onclick={create_entry}
			icon={creating
				? 'fa-spinner fa-spin'
				: 'fa-plus'}
		/>
	</header>

	<DiarySearchForm
		bind:query
		bind:selected_date
		bind:searching
		onsearch={on_date_change}
	/>

	<section>
		<h2
			class="mb-3 text-lg font-semibold [color:var(--color-theme-4)]"
		>
			recent entries
		</h2>
		<DiaryList {entries} />
	</section>

	{#if available_dates.length > 0}
		<section class="space-y-3">
			<h3
				class="text-sm font-semibold [color:var(--color-theme-4)]"
			>
				quick dates
			</h3>
			<div class="flex flex-wrap gap-2">
				{#each available_dates as day (day)}
					<button
						type="button"
						onclick={() => on_date_change(day)}
						class={`rounded-full border px-3 py-1 text-xs transition ${
							selected_date === day
								? 'border-[var(--color-theme-1)] text-[var(--color-theme-1)]'
								: 'border-[var(--color-theme-6)] text-[var(--color-theme-4)]'
						}`}
					>
						{day}
					</button>
				{/each}
			</div>
		</section>
	{/if}
</div>
