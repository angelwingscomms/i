<script lang="ts">
	type Resource = {
		s: 'resource';
		i: string;
		n: string;
		b?: string;
		p?: string[];
		u: string;
		d: number;
		a?: string;
		score?: number;
	};

	let { resource } = $props<{ resource: Resource }>();

	function matchPercent(score?: number) {
		if (typeof score !== 'number') return null;
		const pct = Math.max(0, Math.min(1, score)) * 100;
		return Math.round(pct);
	}

	const p = matchPercent(resource.score);
</script>

<a
	class="group block no-underline"
	href={`/resource_name/${resource.i}`}
>
	<div
		class="flex items-start gap-4 rounded-3xl border-t-0 border-r-0 border-b-0 border-l [border-left-color:var(--color-theme-6)] p-4 transition-all duration-500 [background:transparent] group-hover:-translate-y-0.5 group-hover:[border-left-color:var(--color-theme-1)]"
	>
		<!-- Resource Image -->
		<div class="relative flex-shrink-0">
			<div class="h-16 w-16 overflow-hidden rounded">
				{#if resource.p && resource.p.length > 0}
					<img
						src={resource.p[0]}
						alt={resource.n}
						class="h-full w-full object-cover"
					/>
				{:else}
					<div
						class="flex h-full w-full items-center justify-center text-xl font-bold [color:var(--text-primary)] [background:transparent]"
					>
						{resource.n?.charAt(0).toUpperCase() ??
							'?'}
					</div>
				{/if}
			</div>
		</div>

		<!-- Resource Info -->
		<div class="min-w-0 flex-1">
			<div class="flex items-start justify-between">
				<div class="min-w-0 flex-1">
					<h3
						class="truncate text-lg font-bold [color:var(--color-theme-4)]"
					>
						{resource.n ?? 'Untitled Resource'}
					</h3>

					<!-- Description -->
					{#if resource.b}
						<p
							class="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400"
						>
							{resource.b}
						</p>
					{/if}

					<!-- Summary -->
					{#if resource.a}
						<p
							class="mt-1 text-xs text-gray-500 italic"
						>
							{resource.a}
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
			{#if resource.d}
				<div class="mt-2 text-xs text-gray-500">
					{new Date(resource.d).toLocaleDateString()}
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
