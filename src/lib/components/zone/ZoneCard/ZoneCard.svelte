<script lang="ts">
	type Zone = {
		i: string;
		n?: string;
		l?: number;
		g?: number;
		u?: string;
		d?: number;
		c?: string[];
	};

	let { zone, link = true } = $props<{
		zone: Zone;
		link?: boolean;
	}>();

	const child_count = zone.c?.length ?? 0;

	function format_coord(value?: number) {
		if (typeof value !== 'number') return 'n/a';
		return value.toFixed(5);
	}
</script>

<svelte:element
	this={link ? 'a' : 'div'}
	class="group block rounded-3xl border-l border-[var(--color-theme-6)] bg-transparent p-4 transition-all duration-500 hover:-translate-y-0.5 hover:border-[var(--color-theme-1)]"
	href={link ? `/zones/${zone.i}` : undefined}
>
	<div class="flex items-start justify-between gap-4">
		<div class="min-w-0 flex-1">
			<h3
				class="truncate text-lg font-bold text-[var(--color-theme-4)]"
			>
				{zone.n?.trim() || 'untitled zone'}
			</h3>
			<div
				class="mt-2 grid gap-1 text-sm text-[var(--color-theme-3)]"
			>
				<span>lat: {format_coord(zone.l)}</span>
				<span>lon: {format_coord(zone.g)}</span>
			</div>
		</div>
		<div
			class="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-theme-6)]/10 text-sm font-semibold text-[var(--color-theme-1)]"
		>
			{child_count}
		</div>
	</div>
	{#if zone.d}
		<p
			class="mt-3 text-xs text-[var(--color-theme-3)]"
		>
			updated {new Date(zone.d).toLocaleDateString()}
		</p>
	{/if}
</svelte:element>
