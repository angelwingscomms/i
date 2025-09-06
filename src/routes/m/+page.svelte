<script lang="ts">
	import axios from 'axios';
	import { fade } from 'svelte/transition';

	let q = $state('');
	let loading = $state(false);
	let searched = $state(false);
	let results = $state<{
		i: string;
		l: string;
		p: number;
		a?: string;
		r?: string;
	}[]>([]);

	async function search_memes() {
		loading = true;
		searched = true;
		try {
			const { data } = await axios.post('/m/search', { q });
			results = data || [];
		} catch (e) {
			console.error('search failed', e);
		} finally {
			loading = false;
		}
	}

	function on_key(e: KeyboardEvent) {
		if (e.key === 'Enter') search_memes();
	}

	// initial load: latest memes
	$effect.pre(() => {
		if (!searched) search_memes();
	});

	let modalOpen = $state(false);
	let active: { i: string; l: string; a?: string; r?: string } | null = $state(null);
	function openModal(m: { i: string; l: string; a?: string; r?: string }) {
		active = m;
		modalOpen = true;
	}
	function closeModal() {
		modalOpen = false;
		active = null;
	}
</script>

<div class="page pad">
	<div class="row space-between v-center mb-md">
		<h1 class="title">memes</h1>
		<a class="btn" href="/m/n">upload</a>
	</div>

	<div class="card gap">
		<label class="label" for="meme_search">search memes</label>
		<div class="search-input-group">
			<input
				class="input-underline expand"
				placeholder="Search by meaning or vibe..."
				id="meme_search"
				bind:value={q}
				onkeydown={on_key}
				aria-label="Search memes"
			/>
			<button class="btn-primary btn-search-icon" onclick={search_memes} disabled={loading} aria-label="Search">
				{#if loading}
					<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
				{:else}
					<i class="fas fa-magnifying-glass" aria-hidden="true"></i>
				{/if}
			</button>
		</div>
	</div>

	{#if results.length}
		<div class="grid" role="list" aria-label="meme results" in:fade={{ duration: 120 }}>
			{#each results as r (r.i)}
				<div class="card thumb" role="listitem">
					<button class="thumb-btn" onclick={() => openModal(r)} aria-label={r.a ? `Open meme: ${r.a.slice(0, 80)}` : 'Open meme image'}>
						<img src={r.l} alt={r.a || 'meme image'} loading="lazy" />
					</button>
				</div>
			{/each}
		</div>
	{:else if searched}
		<p class="muted">No memes found.</p>
	{:else}
		<p class="muted">Try searching for a meme.</p>
	{/if}
</div>

{#if modalOpen && active}
	<div
		class="modal_backdrop"
		role="button"
		tabindex="0"
		aria-label="Close meme viewer"
		onclick={closeModal}
		onkeydown={(e) => e.key === 'Escape' && closeModal()}
		in:fade={{ duration: 120 }}
	></div>
	<div class="modal image-modal" role="dialog" aria-modal="true" aria-label="Meme viewer" in:fade={{ duration: 120 }}>
		<div class="image-wrap">
			<img src={active.l} alt={active.a || 'meme image'} />
		</div>
		<div class="row gap">
			{#if active.a}
				<p class="muted" style="flex:1">{active.a}</p>
			{/if}
			{#if active.r}
				<a class="btn" href={`/r/${active.r}`}>View Comments</a>
			{/if}
			<button class="btn ghost" onclick={closeModal}>Close</button>
		</div>
	</div>
{/if}

<style>
	.page {
		max-width: 980px;
		margin: 0 auto;
	}
	.pad { padding: 16px; }
	.row { display: flex; gap: 8px; }
	.space-between { justify-content: space-between; }
	.v-center { align-items: center; }
	.title { font-size: 22px; font-weight: 700; }
	.card { background: transparent; border: none; }
	.gap { display: grid; gap: 8px; }

	.grid {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}
	.thumb { padding: 0; border: none; background: transparent; cursor: pointer; }
	.thumb img {
		width: min(280px, 42vw);
		height: auto;
		border-radius: 8px;
		object-fit: cover;
	}

	.modal_backdrop {
		position: fixed; inset: 0; background: rgba(0,0,0,0.6);
	}
	.modal.image-modal {
		position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%);
		max-width: min(96vw, 980px); width: 96vw; background: #111; color: #fff; border-radius: 12px; padding: 12px;
	}
	.image-wrap { text-align: center; }
	.image-wrap img { max-width: 100%; height: auto; border-radius: 8px; }
</style>

