<script lang="ts">
 import type { Zone } from '$lib/types';
 import Button from '$lib/components/Button.svelte';
 import { page } from '$app/state';
 import { ZoneMap } from '$lib/components/zone';

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
			href="/~/zones"
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
			<div class="space-y-6">
				{#if zone.l !== undefined && zone.g !== undefined}
					<div class="rounded-3xl border border-[var(--border-primary)] p-4">
						<h3 class="mb-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
							location
						</h3>
						<ZoneMap
							lat={zone.l}
							lon={zone.g}
							readonly={true}
							class="h-64 w-full rounded-2xl"
						/>
						<p class="mt-3 text-sm text-[var(--text-secondary)]">
							latitude {zone.l}, longitude {zone.g}
						</p>
					</div>
				{/if}
				{#if zone.c && zone.c.length > 0}
					<div>
						<h3 class="text-lg font-semibold text-[var(--accent-primary)]">
							linked posts
						</h3>
						<ul class="list-disc pl-6 text-sm">
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
