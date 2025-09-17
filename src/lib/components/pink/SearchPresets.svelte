<script lang="ts">
	import axios from 'axios';
	import { fade } from 'svelte/transition';

	export type Preset = {
		i: string;
		n: string;
		p?: string;
		a?: string;
		d?: number;
		x?: string[];
		score?: number;
	};

	let {
		asModal = false,
		open = $bindable(false),
		onSelect
	}: {
		asModal?: boolean;
		open?: boolean;
		onSelect?: (p: Preset) => void;
	} = $props();

	let q = $state('');
	let creating = $state(false);
	let n = $state('');
	let a = $state('');
	let p = $state('');
	let loading = $state(false);
	let results = $state<Preset[]>([]);

	async function search_presets() {
		loading = true;
		try {
			({ data: results } = await axios.post('/pink/presets/search', { q }));
		} finally {
			loading = false;
		}
	}

	async function create_preset() {
		try {
			const name = n.trim();
			const about = a.trim();
			const prompt = p.trim();
			if (!name) return;
			const res = await fetch('/pink/presets', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ n: name, a: about, p: prompt })
			});
			if (!res.ok) throw new Error('failed');
			const { i } = (await res.json()) as { i: string };
			creating = false;
			n = a = p = '';
			await search_presets();
			window.location.href = `/pink/preset/${i}`;
		} catch {
			// noop for now
		}
	}

	function select(preset: Preset) {
		onSelect?.(preset);
		if (asModal) open = false;
	}
</script>

{#if !asModal || open}
	{#if asModal}
		<div
			class="modal_backdrop"
			role="button"
			tabindex="0"
			onclick={() => (open = false)}
			onkeydown={(e) =>
				(e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') && (open = false)}
			in:fade
		></div>
	{/if}
	<div class={asModal ? 'modal card' : ''} in:fade>
		<h2 class="title">search presets</h2>
		<div class="card gap">
			<input
				class="input-underline"
				placeholder="Search presets..."
				bind:value={q}
				onkeydown={(e: KeyboardEvent) => e.key === 'Enter' && search_presets()}
			/>
			<button class="btn-primary btn-compact" onclick={search_presets} disabled={loading}
				>{loading ? 'searching…' : 'search'}</button
			>
		</div>

		<div class="row space-between v-center">
			<h3 class="subtitle">results</h3>
			<button class="btn" onclick={() => (creating = true)}>create preset</button>
		</div>

		{#if creating}
			<div class="card gap" in:fade>
				<label class="label" for="preset_name">name</label>
				<input id="preset_name" class="input-underline" bind:value={n} />
				<label class="label" for="preset_about">about</label>
				<textarea id="preset_about" class="input-underline" rows="2" bind:value={a}></textarea>
				<label class="label" for="preset_prompt">prompt</label>
				<textarea id="preset_prompt" class="input-underline" rows="3" bind:value={p}></textarea>
				<div class="row gap">
					<button class="btn" onclick={create_preset}>save</button>
					<button class="btn ghost" onclick={() => (creating = false)}>cancel</button>
				</div>
			</div>
		{/if}

		{#if results.length}
			<ul class="list">
				{#each results as r (r.i)}
					<li class="item">
						<div class="row space-between v-center">
							<div>
								<div class="result-title">{r.n}</div>
								{#if r.a}<div class="muted">{r.a}</div>{/if}
							</div>
							<div class="row gap">
								{#if r.score !== undefined}
									<div class="badge">{Math.round(Math.max(0, Math.min(1, r.score)) * 100)}%</div>
								{/if}
								<a class="btn ghost" href={`/pink/preset/${r.i}`}>open</a>
								<button class="btn-primary" onclick={() => select(r)}>use</button>
							</div>
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="muted">Use search to find presets.</p>
		{/if}
	</div>
{/if}

<style>
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
		width: min(720px, 92vw);
	}
</style>
