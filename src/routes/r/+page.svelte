<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { toast } from '$lib/util/toast';

	let { data } = $props();
	// state
	let q = '';
	let results: { i: string; t: string }[] = $state(data.r);
	let creating = false;
	let t = '';
	let d = '';
	let loading = false;

	// minimal fetch wrappers
	async function search_rooms() {
		try {
			if (!q.trim()) {
				results = [];
				return;
			}
			loading = true;
			const res = await fetch('/r/search', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ q, f: { s: 'r' } })
			});
			if (!res.ok) throw new Error('search failed');
			results = await res.json();
		} catch (e) {
			toast.error('Search failed. Try again.');
		} finally {
			loading = false;
		}
	}

	async function create_room() {
		try {
			const tag = t.trim();
			const desc = d.trim();
			if (!tag) {
				toast.error('Please enter room tag');
				return;
			}
			const res = await fetch('/r', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ t: tag, d: desc })
			});
			if (!res.ok) throw new Error('create failed');
			const id = await res.text();
			toast.success('Room created');
			creating = false;
			t = '';
			d = '';
			window.location.href = `/r/${id}`;
		} catch {
			toast.error('Failed to create room');
		}
	}

	function on_key(e: KeyboardEvent) {
		if (e.key === 'Enter') search_rooms();
	}

	onMount(() => {
		// no-op init
	});
</script>

<div class="page pad">
	<div class="row space-between v-center">
		<h1 class="title">Chatrooms</h1>
		<button class="btn" on:click={() => (creating = true)}>Add</button>
	</div>

	<div class="card gap">
		<input
			class="input-underline"
			placeholder="Search chatrooms..."
			bind:value={q}
			on:keydown={on_key}
		/>
		<button class="btn" on:click={search_rooms} disabled={loading}
			>{loading ? 'Searching…' : 'Search'}</button
		>
	</div>

	{#if loading}
		<p class="muted">Searching…</p>
	{:else if results.length}
		<ul class="list" in:fade={{ duration: 120 }}>
			{#each results as r (r.i)}
				<li class="item">
					<a class="link" href={`/r/${r.i}`}>{r.t}</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="muted">No results yet.</p>
	{/if}
</div>

{#if creating}
	<div class="modal_backdrop" on:click={() => (creating = false)} in:fade={{ duration: 120 }} />
	<div class="modal card" in:fade={{ duration: 120 }}>
		<h2 class="subtitle">Create chatroom</h2>
		<div class="gap">
			<label class="label">Tag</label>
			<input class="input-underline" bind:value={t} placeholder="e.g. general" />
		</div>
		<div class="gap">
			<label class="label">Description</label>
			<textarea class="input-underline" bind:value={d} rows="3" placeholder="Short description" />
		</div>
		<div class="row gap">
			<button class="btn" on:click={create_room}>Create</button>
			<button class="btn ghost" on:click={() => (creating = false)}>Cancel</button>
		</div>
	</div>
{/if}

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
		background: var(--card);
		border: 1px solid var(--border);
		border-radius: 12px;
		padding: 12px;
	}
	.gap {
		display: grid;
		gap: 8px;
	}
	.input,
	.textarea {
		width: 100%;
		background: var(--input);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 10px 12px;
		color: var(--text);
	}
	.textarea {
		resize: vertical;
	}
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
	.list {
		list-style: none;
		padding: 0;
		margin: 12px 0 0;
		display: grid;
		gap: 8px;
	}
	.item {
		padding: 10px 12px;
		border: 1px solid var(--border);
		border-radius: 10px;
		background: var(--surface);
	}
	.link {
		color: var(--link);
		text-decoration: none;
		font-weight: 600;
	}
	.muted {
		color: var(--muted);
		padding: 8px 0;
	}

	.modal_backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
	}
	.modal {
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		width: min(520px, 92vw);
	}
	.label {
		font-size: 12px;
		color: var(--muted);
	}
</style>
