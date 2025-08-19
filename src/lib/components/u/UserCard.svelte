<script lang="ts">
	type Result = { i: string; t: string; a?: number; g?: number; av?: string; score?: number };

	let { u } = $props<{ u: Result }>();

	function matchPercent(score?: number) {
		if (typeof score !== 'number') return null;
		const pct = Math.max(0, Math.min(1, score)) * 100;
		return Math.round(pct);
	}

	const p = matchPercent(u.score);
</script>

<a class="user-card group block no-underline" href={`/u/${u.i}`}>
	<div
		class="flex items-center gap-4 rounded-2xl p-4 transition-all duration-300"
		style="background: transparent; border: 1px solid var(--color-theme-6);"
	>
		<!-- Avatar -->
		<div class="relative flex-shrink-0">
			<div
				class="h-12 w-12 overflow-hidden rounded-full"
				style="border: 1px solid var(--color-theme-6);"
			>
				{#if u.av}
					<img src={u.av} alt={u.t} class="h-full w-full object-cover" />
				{:else}
					<div
						class="flex h-full w-full items-center justify-center text-lg font-bold"
						style="background: transparent; color: var(--text-primary);"
					>
						{u.t.charAt(0).toUpperCase()}
					</div>
				{/if}
			</div>
		</div>

		<!-- User Info -->
		<div class="min-w-0 flex-1">
			<div class="flex items-center justify-between">
				<h3
					class="truncate text-lg font-bold transition-transform group-hover:scale-105"
					style="color: var(--color-theme-4);"
				>
					{u.t}
				</h3>
				{#if p !== null}
					<span
						class="ml-2 rounded-full px-2 py-1 text-xs font-bold"
						style="background: transparent; border: 1px solid {p >= 80
							? 'var(--color-theme-1)'
							: p >= 60
								? 'var(--color-theme-2)'
								: p >= 40
									? 'var(--color-theme-3)'
									: 'var(--color-theme-6)'}; color: {p >= 80
							? 'var(--color-theme-1)'
							: p >= 60
								? 'var(--color-theme-2)'
								: p >= 40
									? 'var(--color-theme-3)'
									: 'var(--color-theme-6)'};"
					>
						{p}%
					</span>
				{/if}
			</div>

			<!-- Details -->
			<div class="mt-1 flex items-center gap-3 text-sm">
				<span style="color: var(--color-theme-1);">
					{u.a ?? '?'} years
				</span>
				<span style="color: var(--color-theme-2);">
					{u.g === 0 ? 'Male' : u.g === 1 ? 'Female' : 'Other'}
				</span>
			</div>
		</div>

		<!-- Arrow -->
		<div class="flex-shrink-0">
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="currentColor"
				style="color: var(--color-theme-6);"
				class="transition-transform group-hover:translate-x-1"
			>
				<path d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z" />
			</svg>
		</div>
	</div>
</a>
