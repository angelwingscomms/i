<script lang="ts">
	import type { SyncProject } from '$lib/types';

	type SyncListItem = SyncProject & { i: string };

	let { projects = [] } = $props<{ projects?: SyncListItem[] }>();

	const fallback = [
		{
			title: 'tap to add markers',
			copy: 'markers alternate the screen color'
		},
		{
			title: 'upload audio',
			copy: 'line up taps with your beats'
		}
	];
</script>

{#if projects.length === 0}
	<div class="grid gap-6 md:grid-cols-2">
		{#each fallback as item}
			<div class="rounded-3xl border border-dashed border-[var(--color-theme-6)] p-6 text-[var(--text-primary)]">
				<h2 class="text-xl font-semibold">
					{item.title}
				</h2>
				<p class="mt-2 text-sm text-[var(--text-muted)]">
					{item.copy}
				</p>
			</div>
		{/each}
	</div>
{:else}
	<ul class="grid gap-6 md:grid-cols-2">
		{#each projects as project}
			<li>
				<a
					href={`/~/sync/${project.i}`}
					class="group block rounded-3xl border border-[var(--color-theme-6)] px-6 py-5 no-underline transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--color-theme-1)]"
				>
					<div class="flex items-center justify-between gap-4">
						<div class="min-w-0 flex-1">
							<h2 class="truncate text-lg font-semibold text-[var(--color-theme-4)]">
								{project.n ?? 'untitled sync'}
							</h2>
							<p class="mt-2 text-sm text-[var(--text-muted)]">
								{project.t.length} marker{project.t.length === 1 ? '' : 's'}
							</p>
						</div>
						<div class="flex flex-col items-end text-right text-sm text-[var(--text-muted)]">
							<span>{new Date(project.d).toLocaleDateString()}</span>
							{#if project.g?.v}
								<span class="mt-1 inline-flex items-center gap-1 rounded-full bg-[var(--color-theme-1)] px-3 py-1 text-xs font-bold text-white">
									<i class="fa-solid fa-video"></i>
									exported
								</span>
							{/if}
						</div>
					</div>
				</a>
			</li>
		{/each}
	</ul>
{/if}
