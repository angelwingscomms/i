<script lang="ts">
	import type { DiaryEntry } from '$lib/types';
	import { diary_day_key } from '$lib/util/diary';

	let props = $props<{ entries?: DiaryEntry[] }>();
	let entries = $derived(props.entries ?? []);
	let grouped = $derived(
		entries.reduce<Record<string, DiaryEntry[]>>(
			(acc, entry) => {
				const day = diary_day_key(entry.d);
				if (!acc[day]) acc[day] = [];
				acc[day].push(entry);
				return acc;
			},
			{}
		)
	);

	let day_groups = $derived(Object.entries(grouped));

	const format_date = (timestamp: number) =>
		new Date(timestamp).toLocaleDateString();

	const preview = (text: string) =>
		text.length > 140
			? `${text.slice(0, 140)}...`
			: text;
</script>

<div class="space-y-6">
	{#if entries.length === 0}
		<p class="text-sm text-gray-500">
			no diary entries yet
		</p>
	{:else}
		{#each day_groups as [day, day_entries] (day)}
			<section class="space-y-3">
				<header class="flex items-center gap-2">
					<h2
						class="text-lg font-semibold [color:var(--color-theme-4)]"
					>
						{new Date(
							`${day}T00:00:00Z`
						).toLocaleDateString()}
					</h2>
					<span class="text-xs text-gray-400">
						{day_entries.length}
					</span>
				</header>
				<div class="space-y-2">
					{#each day_entries as entry (entry.i || entry.d)}
						<a
							href={`/~/diary/${entry.i}/edit`}
							class="block rounded-xl border-l border-[var(--color-theme-6)] bg-transparent p-4 transition hover:-translate-y-0.5 hover:border-[var(--color-theme-1)]"
						>
							<div
								class="flex items-start justify-between gap-4"
							>
								<div class="min-w-0 flex-1">
									<p class="text-sm text-gray-600">
										{preview(entry.a)}
									</p>
								</div>
								<time class="text-xs text-gray-400">
									{format_date(entry.d)}
								</time>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/each}
	{/if}
</div>
