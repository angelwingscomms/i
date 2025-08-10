<script lang="ts">
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { toast } from '$lib/util/toast';

	let { data } = $props();
	// state
	let q = $state('');
    let results: { i: string; t: string; l?: number; m?: number; score?: number }[] = $state(data.r);
	let creating = $state(false);
	let t = $state('');
	let d = $state('');
	let loading = $state(false);

	// minimal fetch wrappers
	async function search_rooms() {
	loading = true;
		try {
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
        <h1 class="title">search chatrooms</h1>
        <button class="btn-primary btn-wide" onclick={() => (creating = true)}>add chatroom</button>
	</div>

	<div class="card gap">
		<input
			class="input-underline"
			placeholder="Search chatrooms..."
			id="room_search"
			bind:value={q}
			onkeydown={on_key}
		/>
        <button class="btn-primary btn-compact" onclick={search_rooms} disabled={loading}
            >{loading ? 'searching…' : 'search'}</button
		>
	</div>

	{#if results.length}
		<ul class="list" in:fade={{ duration: 120 }}>
            {#each results as r (r.i)}
                <li class="item">
                    <a class="link" href={`/r/${r.i}`}>
                        <div class="row space-between v-center">
                            <div>
                                <div class="result-title">{r.t}</div>
                                <div class="result-meta muted">{r.m ?? 0} members</div>
                            </div>
                            {#if r.score !== undefined}
                                <div class="badge">{Math.round(Math.max(0, Math.min(1, r.score)) * 100)}%</div>
                            {/if}
                        </div>
                    </a>
                </li>
			{/each}
		</ul>
	{:else}
		<p class="muted">Try searching for a chatroom.</p>
	{/if}
</div>

{#if creating}
    <div class="modal_backdrop" role="button" tabindex="0" onclick={() => (creating = false)} onkeydown={(e) => e.key==='Escape' && (creating=false)} in:fade={{ duration: 120 }}></div>
	<div class="modal card" in:fade={{ duration: 120 }}>
        <h2 class="subtitle">create chatroom</h2>
		<div class="gap">
			<label class="label" for="room_tag">tag</label>
			<input id="room_tag" class="input-underline" bind:value={t} placeholder="e.g. general" />
		</div>
		<div class="gap">
            <label class="label" for="room_desc">description</label>
            <textarea id="room_desc" class="input-underline" bind:value={d} rows="3" placeholder="Short description"></textarea>
		</div>
		<div class="row gap">
			<button class="btn" onclick={create_room}>Create</button>
			<button class="btn ghost" onclick={() => (creating = false)}>Cancel</button>
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
    .badge {
        padding: 4px 8px;
        border-radius: 999px;
        background: var(--accent-emerald);
        color: white;
        font-weight: 700;
        font-size: 12px;
    }
</style>
