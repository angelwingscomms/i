<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { toast } from '$lib/util/toast.svelte.js';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import type { Event } from '$lib/types/index';
	import Button from '$lib/components/Button.svelte';

	import { EventSearch } from '$lib/components/event';

	let { data } = $props();
	// state
	let q = $state('');
	let events = $state(data.p || []);
	let creating = $state(false);

	let loading = $state(false);
	let searched = $state(false);

	// minimal fetch wrappers
	async function search() {
		loading = true;
		searched = true;
		try {
			({ data: events } = await axios.post(
				'/event/search',
				{ q }
			));
		} catch (e) {
			toast.error('Search failed. Try again.');
		} finally {
			loading = false;
		}
	}

	async function add() {
		creating = true; // Set creating to true
		try {
			const res = await axios.post('/~/event');
			console.log('add res', res);
			if (res.status === 401) {
				toast.error(
					'you must be logged in to add an event'
				);
				return;
			}
			if (res.statusText !== 'OK')
				throw new Error('add failed');
			goto(`/~/event/add`);
		} catch (e) {
			toast.error('Failed to add event');
		} finally {
			creating = false; // Reset creating in finally block
		}
	}

	function on_key(e: KeyboardEvent) {
		if (e.key === 'Enter') search();
	}

	onMount(() => {
		// no-op init
	});
</script>

<div class="page pad">
	<div class="row space-between v-center mb-md">
		<h1 class="title">events</h1>
		<Button
			text="add event"
			icon={creating ? 'fa-spinner fa-spin' : ''}
			href="/~/event/add"
			wide={true}
		/>
	</div>

	<EventSearch
		bind:q
		bind:events
		bind:loading
		onSearch={() => (searched = true)}
	/>
</div>

<style>
	/* Use custom utility classes defined in app.css (no raw Tailwind) */
	.page {
		max-width: 720px;
		margin: 0 auto;
	}
	.pad {
		padding: 16px;
	}
	.row {
		display: flex;
		gap: 8px;
	}
	.space-between {
		justify-content: space-between;
	}
	.v-center {
		align-items: center;
	}
	.title {
		font-size: 22px;
		font-weight: 700;
	}
	.subtitle {
		font-size: 18px;
		font-weight: 600;
		margin-bottom: 8px;
	}
	.card {
		background: transparent;
		border: 1px solid var(--color-theme-6);
		border-radius: 12px;
		padding: 12px;
	}
	.gap {
		display: grid;
		gap: 8px;
	}
	/* reserved for future inputs */
	.btn {
		background: var(--btn);
		color: var(--btn-text);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 8px 12px;
		font-weight: 600;
		cursor: pointer;
	}
	.btn.ghost {
		background: transparent;
		color: var(--text);
	}
	.btn-compact {
		width: fit-content;
	}
	.btn-wide {
		padding-left: 24px;
		padding-right: 24px;
	}
	.list {
		list-style: none;
		padding: 0;
		margin: 12px 0 0;
		display: grid;
		gap: 8px;
	}
	.item {
		border-left: 1px solid var(--color-theme-6);
		border-bottom: 1px solid var(--color-theme-6);
		border-radius: 0 0 0 10px;
		background: transparent;
	}
	.link {
		color: var(--link);
		text-decoration: none;
		font-weight: 600;
		display: block;
		padding: 10px 12px;
		width: 100%;
		height: 100%;
	}
	.muted {
		color: var(--muted);
		padding: 8px 0;
	}

	.modal_backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(10px);
	}

	.search-input-group {
		display: flex;
		align-items: center;
		gap: 8px; /* Adjust gap as needed */
	}

	.expand {
		flex-grow: 1; /* Allows the input to take up available space */
	}
</style>
