<script lang="ts">
	import type { Resume } from '$lib/types';
	import Button from '$lib/components/Button.svelte';
	let { data } = $props();
	let r: Resume = data.r;
	let user = data.user;
	let owner = data.owner;
</script>

<svelte:head>
	<title>{owner.t || 'Resume'}</title>
</svelte:head>

<div class="mx-auto max-w-4xl p-4 md:p-8">
	<div class="mb-6">
		<Button text="explore all posts" href="/resume" icon="fa-arrow-left" variant="secondary" />
	</div>

	<div class="mb-8 flex items-start justify-between">
		<div>
			<h1
				class="text-3xl font-bold text-[var(--accent-primary)]"
			>
				{owner.t}<span
					class="text-[var(--text-accent)]"
					>'s resume</span
				>
			</h1>
			<p class="text-sm text-[var(--text-secondary)]">
				Last updated {new Date(
					r.l || r.d
				).toLocaleDateString()}
			</p>
		</div>
		<div class="flex gap-2">
			<Button
				text="Full page view"
				href={`/resume/${r.i}/full_page_view`}
				icon="fa-expand"
			/>
			<Button
				text={user?.i === r.u
					? 'Edit'
					: 'View author'}
				href={user?.i === r.u
					? `/resume/${r.i}/edit`
					: `/u/${r.u}`}
				icon={user?.i === r.u ? 'fa-edit' : undefined}
			/>
		</div>
	</div>

	<div
		class="mx-auto max-w-[21cm] overflow-hidden rounded-lg"
	>
		{#if r.h}
			<div class="bg-secondary rounded-lg p-4">
				<iframe
					srcdoc={r.h}
					class="mx-auto h-[29.7cm] w-[21cm] rounded border-0"
				></iframe>
			</div>
		{/if}
	</div>
</div>
