<script lang="ts">
	let { minAge = $bindable(0), maxAge = $bindable(144) }: { minAge: number; maxAge: number } = $props();
</script>

<div class="flex-1">
	<div class="mb-3 block text-sm font-bold" style="color: var(--color-theme-4);">
		Age Range
	</div>
	<div class="space-y-4">
		<div class="flex items-center gap-4">
			<span class="text-sm font-medium" style="color: var(--color-theme-1);"
				>Min: {minAge}</span
			>
			<input
				type="range"
				min="0"
				max="144"
				bind:value={minAge}
				class="flex-1 accent-[var(--color-theme-1)]"
				oninput={() => {
					if (minAge > maxAge) maxAge = minAge;
				}}
			/>
		</div>
		<div class="flex items-center gap-4">
			<span class="text-sm font-medium" style="color: var(--color-theme-2);"
				>Max: {maxAge}</span
			>
			<input
				type="range"
				min="0"
				max="144"
				bind:value={maxAge}
				class="flex-1 accent-[var(--color-theme-2)]"
				oninput={() => {
					if (maxAge < minAge) minAge = maxAge;
				}}
			/>
		</div>
	</div>
</div>
