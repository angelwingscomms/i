<script lang="ts">
	import SyncEditor from '$lib/components/sync/SyncEditor.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.s.n ?? 'sync editor'} - apexlinks</title>
	<meta
		name="description"
		content="tap markers to create alternating videos"
	/>
</svelte:head>

<section class="min-h-screen bg-[var(--surface-primary)] py-12">
	<div class="mx-auto max-w-5xl px-4">
		<nav class="mb-8 text-sm text-[var(--text-muted)]">
			<a href="/~/sync" class="hover:text-[var(--color-theme-1)]">
				sync
			</a>
			<span class="px-2">/</span>
			<span class="text-[var(--text-primary)]">
				{data.s.n ?? 'untitled sync'}
			</span>
		</nav>

		<SyncEditor project={data.s} />
	</div>
</section>
