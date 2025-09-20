<script lang="ts">
	type Item = {
		i: string;
		t?: string;
		d?: string;
		k?: number;
		a?: number;
		q?: string;
		x?: string[];
		score?: number;
	};

	let { item } = $props<{ item: Item }>();

	function matchPercent(score?: number) {
		if (typeof score !== 'number') return null;
		const pct = Math.max(0, Math.min(1, score)) * 100;
		return Math.round(pct);
	}

	const p = matchPercent(item.score);
</script>

<a
	class="group block no-underline"
	href={`/i/${item.i}`}
>
	<div
		class="flex items-start gap-4 rounded-3xl p-4 transition-all duration-500 border-l border-t-0 border-r-0 border-b-0 [border-left-color:var(--color-theme-6)] [background:transparent] group-hover:-translate-y-0.5 group-hover:[border-left-color:var(--color-theme-1)]"
	>
		<!-- Item Image -->
		<div class="relative flex-shrink-0">
			<div class="h-16 w-16 overflow-hidden rounded">
				{#if item.x && item.x.length > 0}
					<img
						src={item.x[0]}
						alt={item.t}
						class="h-full w-full object-cover"
					/>
				{:else}
					<div
						class="flex h-full w-full items-center justify-center text-xl font-bold [color:var(--text-primary)] [background:transparent]"
					>
						{item.t?.charAt(0).toUpperCase() ?? '?'}
					</div>
				{/if}
			</div>
			<!-- Item Type Badge -->
			<div class="absolute -right-1 -bottom-1">
				<span
					class="rounded px-2 py-1 text-xs font-medium [background:var(--color-theme-{item.k ===
					0
						? '1'
						: '2'})] [color:white]"
				>
					{item.k === 0 ? '🛍️' : '⚡'}
				</span>
			</div>
		</div>

		<!-- Item Info -->
		<div class="min-w-0 flex-1">
			<div class="flex items-start justify-between">
				<div class="min-w-0 flex-1">
					<h3
						class="truncate text-lg font-bold [color:var(--color-theme-4)]"
					>
						{item.t ?? 'Untitled Item'}
					</h3>

					<!-- Description -->
					{#if item.d}
						<p
							class="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400"
						>
							{item.d}
						</p>
					{/if}

					<!-- Quick Summary -->
					{#if item.q}
						<p
							class="mt-1 text-xs text-gray-500 italic"
						>
							{item.q}
						</p>
					{/if}
				</div>

				<!-- Match Score -->
				{#if p !== null}
					<span
						class="ml-2 flex-shrink-0 rounded px-2 py-1 text-xs font-bold [color:var(--color-theme-1)] [background:transparent]"
					>
						{p}%
					</span>
				{/if}
			</div>

			<!-- Date -->
			{#if item.a}
				<div class="mt-2 text-xs text-gray-500">
					{new Date(item.a).toLocaleDateString()}
				</div>
			{/if}
		</div>

		<!-- Arrow -->
		<div class="flex-shrink-0">
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="text-[var(--color-theme-6)] transition-transform group-hover:translate-x-1"
			>
				<path
					d="M4,11V13H16L10.5,18.5L11.92,19.92L19.84,12L11.92,4.08L10.5,5.5L16,11H4Z"
				/>
			</svg>
		</div>
	</div>
</a>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>
