<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import SyncProjectList from '$lib/components/sync/SyncProjectList.svelte';../../sync/$types.js

	let { data } = $props();
</script>

<svelte:head>
	<title>sync projects - apexlinks</title>
	<meta
		name="description"
		content="create beat synced videos"
	/>
</svelte:head>

<section class="min-h-screen bg-[var(--surface-primary)]">
	<header class="from-theme-1 to-theme-2 bg-gradient-to-r text-white">
		<div class="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10">
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div class="space-y-1">
					<h1 class="text-4xl font-bold">sync</h1>
					<p class="text-white/70">
						make alternating black and white videos in time with your taps
					</p>
				</div>
				<Button href="/~/sync/create" text="create sync" icon="fa-plus" />
			</div>
		</div>
	</header>

	<div class="mx-auto max-w-5xl px-4 py-10">
		<SyncProjectList projects={data.s} />
	</div>
</section>
