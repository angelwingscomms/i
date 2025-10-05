<script lang="ts">
	import type { Zone } from '$lib/types';
	import Button from '$lib/components/Button.svelte';
	import { page } from '$app/state';

	let { data } = $props(),
		zone: Zone = data.z;

	const currentUser = page.data.user;
</script>

<svelte:head>
	<title>{zone.n}</title>
</svelte:head>

<div class="mx-auto max-w-4xl p-4 md:p-8">
	<div class="mb-6">
		<a
			href="/zones"
			class="inline-flex items-center font-medium lowercase text-[var(--text-accent)] transition-colors hover:text-[var(--accent-primary)]"
			>&larr; back to zones</a
		>
	</div>

	<div class="mb-8 flex items-start justify-between">
		<div>
			<h1 class="text-3xl font-bold text-[var(--accent-primary)]">
				{zone.n}
			</h1>
			<p class="text-sm lowercase text-[var(--text-secondary)]">
				created {new Date(
					zone.d
				).toLocaleDateString()}
			</p>
		</div>
		<div class="flex items-center gap-2">
			{#if currentUser?.i === zone.u}
				<Button
					text="edit"
					href={`/zones/${zone.i}/edit`}
					icon="fa-edit"
				/>
			{/if}
		</div>
	</div>

	<article class="overflow-hidden rounded-lg">
		<div
			class="prose prose-invert prose-lg max-w-none px-6 pt-6"
		>
			<div class="space-y-4">
				<p>latitude: {zone.l}</p>
				<p>longitude: {zone.g}</p>
				{#if zone.c && zone.c.length > 0}
					<div>
						<h3>linked posts</h3>
						<ul class="list-disc pl-6">
							{#each zone.c as childId}
								<li>
									<a
										href={`/posts/${childId}`}
										class="underline"
										>post {childId}</a
									>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</div>
	</article>
</div>
