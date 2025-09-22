<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import { toast } from '$lib/util/toast.svelte.js';
	import { enhance } from '$app/forms';

	let { data } = $props();
	let zone = $state(data.z);
</script>

<div class="mx-auto max-w-2xl p-4">
	<div class="mb-6">
		<a href={`/zones/${zone.i}`} class="inline-flex items-center font-medium text-[var(--text-accent)] hover:text-[var(--accent-primary)]">&larr; Back to zone</a>
	</div>

	<h1 class="text-2xl font-bold text-[var(--accent-primary)] mb-6">Edit Zone</h1>

	<form method="POST" use:enhance={{ onError: (e) => toast.error(e.detail.result.message || 'Failed to update zone') }}>
		<input type="hidden" name="i" value={zone.i} />

		<div class="space-y-6">
			<div>
				<label class="block text-sm font-medium text-[var(--text-secondary)] mb-2">Name</label>
				<DescriptionInput
					bind:value={zone.n}
					placeholder="Enter zone name"
					label=""
					editable={true}
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="block text-sm font-medium text-[var(--text-secondary)] mb-2">Latitude</label>
					<input
						type="number"
						step="any"
						name="l"
						value={zone.l}
						placeholder="Latitude"
						class="w-full rounded border border-[var(--border)] px-3 py-2 text-[var(--text)] bg-[var(--bg)]"
						required
					/>
				</div>
				<div>
					<label class="block text-sm font-medium text-[var(--text-secondary)] mb-2">Longitude</label>
					<input
						type="number"
						step="any"
						name="g"
						value={zone.g}
						placeholder="Longitude"
						class="w-full rounded border border-[var(--border)] px-3 py-2 text-[var(--text)] bg-[var(--bg)]"
						required
					/>
				</div>
			</div>

			<Button text="Update Zone" type="submit" wide={true} />
		</div>
	</form>
</div>