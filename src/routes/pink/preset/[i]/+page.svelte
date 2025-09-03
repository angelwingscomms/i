<script lang="ts">
	type Preset = { i: string; n: string; a?: string; p?: string; x?: string[] };
	let { data } = $props();
	let p: Preset = (data as any).p;
</script>

<div class="page pad">
	<div class="row space-between v-center">
		<h1 class="title">{p.n}</h1>
		<a class="btn" href="/pink">use preset</a>
	</div>
	{#if p.a}<p class="muted">{p.a}</p>{/if}
	{#if p.p}
		<div class="card">
			<h3 class="subtitle">prompt</h3>
			<pre style="white-space: pre-wrap">{p.p}</pre>
		</div>
	{/if}
	{#if p.x?.length}
		<div class="card">
			<h3 class="subtitle">images</h3>
			<div
				class="grid"
				style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 12px;"
			>
				{#each p.x as src, idx}
					<img
						{src}
						alt={`preset-${idx}`}
						style="width:100%; border-radius: 10px; border:1px solid var(--color-theme-6);"
					/>
				{/each}
			</div>
		</div>
	{/if}
</div>
