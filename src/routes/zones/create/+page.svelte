<script lang="ts">
	import { page } from '$app/state';
	import { enhance } from '$app/forms';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import { toast } from '$lib/util/toast.svelte.js';

	let { data } = $props();
	let zone = $state(
		data.z || { n: '', l: 0, g: 0, i: '' }
	);
</script>

<div class="mx-auto max-w-2xl p-4">
	<div class="mb-6">
		<a
			href="/zones"
			class="inline-flex items-center font-medium text-[var(--text-accent)] hover:text-[var(--accent-primary)]"
			>&larr; Back to zones</a
		>
	</div>

	<h1
		class="mb-6 text-2xl font-bold text-[var(--accent-primary)]"
	>
		Create Zone
	</h1>

	<form
		method="POST"
		use:enhance={{
			onError: (e) =>
				toast.error(
					e.detail.result.message ||
						'Failed to create zone'
				)
		}}
	>
		<input type="hidden" name="i" value={zone.i} />

		<div class="space-y-4">
			<div>
				<label
					class="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
					>Name</label
				>
				<DescriptionInput
					bind:value={zone.n}
					placeholder="Enter zone name"
					label=""
					editable={true}
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label
						class="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
						>Latitude</label
					>
					<input
						type="number"
						step="any"
						bind:value={zone.l}
						placeholder="Latitude"
						class="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)]"
						required
					/>
				</div>
				<div>
					<label
						class="mb-2 block text-sm font-medium text-[var(--text-secondary)]"
						>Longitude</label
					>
					<input
						type="number"
						step="any"
						bind:value={zone.g}
						placeholder="Longitude"
						class="w-full rounded border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--text)]"
						required
					/>
				</div>
			</div>

			<Button
				text="Create Zone"
				type="submit"
				wide={true}
			/>
		</div>
	</form>
</div>
