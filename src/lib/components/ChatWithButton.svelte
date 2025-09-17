<script lang="ts">
	const { href, text }: { href: string; text: string } = $props();
</script>

<div class="mb-12 flex justify-center">
	<a
		{href}
		class="action-button group relative overflow-hidden rounded-full px-12 py-6 text-xl font-bold text-white shadow-2xl transition-all"
		style="background: var(--color-theme-2);"
	>
		<div
			class="absolute inset-0 bg-white opacity-0 transition-opacity group-hover:opacity-20"
		></div>
		<div class="relative flex items-center gap-3">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
				<path
					d="M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2M6,9H18V11H6V9M14,14H6V12H14V14M18,8H6V6H18V8Z"
				/>
			</svg>
			{text}
		</div>
	</a>
</div>
