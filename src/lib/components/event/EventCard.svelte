<script lang="ts">
	import type { Event } from '$lib/types/event';

	let { event } = $props<{ event: Event }>();
</script>

<a
	class="group block no-underline"
	href={`/~/event/${event.i ?? ''}`}
>
	<div
		class="flex h-64 w-64 flex-col items-center justify-center rounded-3xl p-4 transition-all duration-500 hover:-translate-y-0.5"
	>
		<div class="relative flex-shrink-0">
			<div class="h-40 w-40 overflow-hidden rounded">
				{#if event.p}
					<img
						src={event.p}
						alt={event.t}
						class="h-full w-full object-contain"
					/>
				{:else}
					<div
						class="flex h-full w-full items-center justify-center text-2xl font-bold text-[var(--text-primary)]"
					>
						{event.t?.charAt(0).toUpperCase() ?? '?'}
					</div>
				{/if}
			</div>
		</div>

		<div class="min-w-0 flex-1 text-center">
			<div class="flex items-start justify-between">
				<div class="min-w-0 flex-1">
					<h3
						class="truncate text-lg font-bold text-[var(--color-theme-4)]"
					>
						{event.t ?? 'untitled event'}
					</h3>

					{#if event.y}
						<p
							class="mt-1 text-xs text-gray-500 italic"
						>
							{event.y}
						</p>
					{/if}
				</div>
			</div>

			{#if event.d}
				<div class="mt-2 text-xs text-gray-500">
					{new Date(event.d).toLocaleDateString()}
				</div>
			{/if}
		</div>
	</div>
</a>
