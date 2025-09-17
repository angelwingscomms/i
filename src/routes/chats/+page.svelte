<script lang="ts">
	let { data } = $props();
	let results: {
		i: string;
		t: string;
		l?: number;
		m?: number;
	}[] = $state((data as any).r || []);

	async function refresh() {
		try {
			const res = await fetch('/chats', {
				method: 'POST'
			});
			if (!res.ok) throw new Error('failed');
			results = await res.json();
		} catch {
			// no-op
		}
	}
</script>

<div class="page pad">
	<div class="row space-between v-center">
		<h1 class="title">your chats</h1>
		<button class="btn" onclick={refresh}
			>refresh</button
		>
	</div>

	{#if results.length}
		<ul class="list">
			{#each results as r (r.i)}
				<li class="item">
					<a class="link" href={`/r/${r.i}`}>
						<div class="row space-between v-center">
							<div>
								{#if r._ === '-'}
									{#if r.t}
										<div
											class="result-meta muted italic"
										>
											{r.t}
										</div>
									{:else}
										<div
											class="result-meta muted italic"
										>
											anonymous user
										</div>
									{/if}
								{:else}
									<div class="result-meta muted">
										{r.t}
									</div>
								{/if}
							</div>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="muted">No chats yet.</p>
	{/if}
</div>

<style>
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
	.list {
		list-style: none;
		padding: 0;
		margin: 12px 0 0;
		display: grid;
		gap: 8px;
	}
	.item {
		padding: 10px 12px;
		border: 1px solid var(--color-theme-6);
		border-radius: 10px;
		background: transparent;
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
	.btn {
		background: var(--btn);
		color: var(--btn-text);
		border: 1px solid var(--border);
		border-radius: 10px;
		padding: 8px 12px;
		font-weight: 600;
		cursor: pointer;
	}
</style>
