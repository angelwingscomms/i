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
			class="inline-flex items-center font-medium text-[var(--text-accent)] transition-colors hover:text-[var(--accent-primary)]"
			>&larr; Back to zones</a
		>
	</div>

	<div class="mb-8 flex items-start justify-between">
		<div>
			<h1
				class="text-3xl font-bold text-[var(--accent-primary)]"
			>
				{zone.n}
			</h1>
			<p class="text-sm text-[var(--text-secondary)]">
				Created {new Date(
					zone.d
				).toLocaleDateString()}
			</p>
		</div>
		<div class="flex items-center gap-2">
			{#if currentUser?.i === zone.u}
				<Button
					text="Edit"
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
				<p><strong>Latitude:</strong> {zone.l}</p>
				<p><strong>Longitude:</strong> {zone.g}</p>
				{#if zone.C && zone.C.length > 0}
					<div>
						<h3>Associated Posts/Items:</h3>
						<ul class="list-disc pl-6">
							{#each zone.C as childId}
								<li>
									<a
										href={`/posts/${childId}`}
										class="underline"
										>Post/Item {childId}</a
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
