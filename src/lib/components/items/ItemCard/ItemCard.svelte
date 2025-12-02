<script lang="ts">
	import type { Item } from '$lib/types/item';
	import { match_percent } from '$lib/util/items/match_percent';

	type ItemWithScore = Item & { score?: number };

	let { item } = $props<{ item: ItemWithScore }>();

	const p = match_percent(item.score);
</script>

<a
	class="group block no-underline"
	href={`/~/items/${item.i ?? ''}`}
>
	<div
		class="flex h-64 w-64 flex-col items-center justify-center rounded-3xl p-4 transition-all duration-500 hover:-translate-y-0.5"
	>
		<div class="relative flex-shrink-0">
			<div class="h-40 w-40 overflow-hidden rounded">
				{#if item.x && item.x.length > 0}
					<img
						src={item.x[0]}
						alt={item.n}
						class="h-full w-full object-contain"
					/>
				{:else}
				<div
					class="h-full w-full rounded"
					style="border: 1px solid rgba(var(--color-theme-1-rgb, 139, 92, 246), 0.3); box-shadow: 0 0 8px rgba(var(--color-theme-1-rgb, 139, 92, 246), 0.2);"
				>
				</div>
			{/if}
			</div>
			<div class="absolute -right-1 -bottom-1">
				<span
					class={`rounded px-2 py-1 text-xs font-medium text-white ${
						item.k === 0
							? 'bg-[var(--color-theme-1)]'
							: 'bg-[var(--color-theme-2)]'
					}`}
				>
					<i
						class={`fas ${item.k === 0 ? 'fa-shopping-bag' : 'fa-wrench'}`}
					></i>
				</span>
			</div>
		</div>

		<div class="min-w-0 flex-1 text-center">
			<div class="flex items-start justify-between">
				<div class="min-w-0 flex-1">
					<h3
						class="truncate text-lg font-bold text-[var(--color-theme-4)]"
					>
						{item.n ?? 'untitled item'}
					</h3>

					{#if item.q}
						<p
							class="mt-1 text-xs text-gray-500 italic"
						>
							{item.q}
						</p>
					{/if}
				</div>

				{#if p !== null}
					<span
						class="ml-2 flex-shrink-0 rounded px-2 py-1 text-xs font-bold text-[var(--color-theme-1)]"
					>
						{p}%
					</span>
				{/if}
			</div>

			{#if item.d}
				<div class="mt-2 text-xs text-gray-500">
					{new Date(item.d).toLocaleDateString()}
				</div>
			{/if}
		</div>
	</div>
</a>
