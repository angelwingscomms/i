<script lang="ts">
	let { gender = $bindable() }: { gender: number | undefined } = $props();
</script>

<div class="flex-1">
	<fieldset>
		<legend class="mb-3 block text-sm font-bold" style="color: var(--color-theme-4);"
			>Gender Preference</legend
		>
		<div class="flex gap-2">
			<label class="flex-1">
				<input type="radio" class="sr-only" bind:group={gender} value={undefined} />
				<div
					class="cursor-pointer rounded-full px-4 py-3 text-center font-semibold transition-all {gender ==
					null
						? 'text-white'
						: 'text-gray-600 hover:bg-gray-100'}"
					style={gender == null
						? `background: transparent; border: 2px solid var(--color-theme-6);`
						: 'background: transparent; border: 2px solid var(--color-theme-6);'}
				>
					Any
				</div>
			</label>
			<label class="flex-1">
				<input type="radio" class="sr-only" bind:group={gender} value={0} />
				<div
					class="cursor-pointer rounded-full px-4 py-3 text-center font-semibold transition-all {gender ===
					0
						? 'text-white'
						: 'text-gray-600 hover:bg-gray-100'}"
					style={gender === 0
						? `background: transparent; border: 2px solid var(--color-theme-2);`
						: 'background: transparent; border: 2px solid var(--color-theme-2);'}
				>
					Male
				</div>
			</label>
			<label class="flex-1">
				<input type="radio" class="sr-only" bind:group={gender} value={1} />
				<div
					class="cursor-pointer rounded-full px-4 py-3 text-center font-semibold transition-all {gender ===
					1
						? 'text-white'
						: 'text-gray-600 hover:bg-gray-100'}"
					style={gender === 1
						? `background: transparent; border: 2px solid var(--color-theme-3);`
						: 'background: transparent; border: 2px solid var(--color-theme-3);'}
				>
					Female
				</div>
			</label>
		</div>
	</fieldset>
</div>
