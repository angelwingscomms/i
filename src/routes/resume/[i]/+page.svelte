<script lang="ts">
	import type { Resume } from '$lib/types';
	import Button from '$lib/components/Button.svelte';
	let { data } = $props();
	let r: Resume = data.r;
	let user = data.user;
</script>

<svelte:head>
	<title>{r.t || 'Resume'}</title>
</svelte:head>

<div class="mx-auto max-w-4xl p-4 md:p-8">
	<div class="mb-6">
		<a
			href="/resume"
			class="inline-flex items-center font-medium text-[var(--text-accent)] transition-colors hover:text-[var(--accent-primary)]"
			>&larr; Back to resumes</a
		>
	</div>

	<div class="mb-8 flex items-start justify-between">
		<div>
			<h1
				class="text-3xl font-bold text-[var(--accent-primary)]"
			>
				{r.t || 'Resume'}
			</h1>
			<p class="text-sm text-[var(--text-secondary)]">
				Created {new Date(r.d).toLocaleDateString()}
			</p>
		</div>
		<Button
			text={user?.i === r.u ? 'Edit' : 'View author'}
			href={user?.i === r.u
				? `/resume/${r.i}/edit`
				: `/u/${r.u}`}
			icon={user?.i === r.u ? 'fa-edit' : undefined}
			class="font-medium text-[var(--text-accent)] transition-colors hover:text-[var(--accent-primary)]"
		/>
	</div>

	<div class="overflow-hidden rounded-lg">
		{#if r.h}
			<div class="bg-secondary rounded-lg p-4">
				<iframe
					srcdoc={r.h}
					class="border-border h-[600px] w-full rounded border"
				></iframe>
			</div>
		{/if}
	</div>
</div>
