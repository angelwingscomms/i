<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import { ZoneMap } from '$lib/components/zone';
	import { toast } from '$lib/util/toast.svelte.js';
	import { enhance } from '$app/forms';

	let { data } = $props();
	let zone = $state(data.z);
	let map_visible = $state(true);
</script>

<div class="mx-auto max-w-2xl p-4">
	<div class="mb-6">
		<a
			href={`/zones/${zone.i}`}
			class="inline-flex items-center font-medium text-[var(--text-accent)] lowercase hover:text-[var(--accent-primary)]"
			>&larr; back to zone</a
		>
	</div>

	<h1
		class="mb-6 text-2xl font-bold text-[var(--accent-primary)] lowercase"
	>
		edit zone
	</h1>

	<form
		method="POST"
		use:enhance={{
			onError: (e) =>
				toast.error(
					e.detail.result.message ||
						'failed to update zone'
				)
		}}
	>
		<input type="hidden" name="i" value={zone.i} />

		<div class="space-y-6">
			<div>
				<label
					class="mb-2 block text-sm font-medium text-[var(--text-secondary)] lowercase"
					for="zone-name"
				>
					name
				</label>
				<DescriptionInput
					id="zone-name"
					bind:value={zone.n}
					placeholder="enter zone name"
					label=""
					editable={true}
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label
						class="mb-2 block text-sm font-medium text-[var(--text-secondary)] lowercase"
						for="zone-lat"
					>
						latitude
					</label>
					<input
						id="zone-lat"
						type="number"
						step="any"
						name="l"
						bind:value={zone.l}
						placeholder="latitude"
						class="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)]"
						required
					/>
				</div>
				<div>
					<label
						class="mb-2 block text-sm font-medium text-[var(--text-secondary)] lowercase"
						for="zone-lon"
					>
						longitude
					</label>
					<input
						id="zone-lon"
						type="number"
						step="any"
						name="g"
						bind:value={zone.g}
						placeholder="longitude"
						class="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)]"
						required
					/>
				</div>
			</div>

			{#if map_visible && zone.l !== undefined && zone.g !== undefined}
				<div class="space-y-2">
					<label
						class="mb-2 block text-sm font-medium text-[var(--text-secondary)] lowercase"
						for="zone-map"
					>
						adjust location
					</label>
					<ZoneMap
						id="zone-map"
						lat={zone.l || 0}
						lon={zone.g || 0}
						onchange={({ detail }) => {
							zone.l = Number(detail.lat.toFixed(6));
							zone.g = Number(detail.lon.toFixed(6));
						}}
					/>
					<p
						class="text-xs text-[var(--color-theme-3)] lowercase"
					>
						move the pin or tap the map to set the
						exact spot
					</p>
				</div>
			{/if}

			<Button
				text="update zone"
				type="submit"
				wide={true}
			/>
		</div>
	</form>
</div>
