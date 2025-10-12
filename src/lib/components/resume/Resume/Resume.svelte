<script lang="ts">
	import type { Resume } from '$lib/types';
	import Button from '$lib/components/Button.svelte';
	let { data } = $props();
	const resume: Resume = data.r;
	const viewer = data.user ?? null;
	const owner_tag =
		data.u?.t ?? resume.xt ?? 'unknown user';
	const owner_label = owner_tag.toLowerCase();
	const viewer_is_owner =
		Boolean(viewer?.i) && viewer?.i === resume.u;
	const owner_link =
		owner_tag === 'unknown user'
			? '/'
			: `/${owner_tag}`;
	const updated_at = new Date(resume.l ?? resume.d);
</script>

<svelte:head>
	<title>{owner_label}</title>
</svelte:head>

<div class="mx-auto max-w-4xl p-4 md:p-8">
	<div class="mb-6">
		<Button
			text="explore all resumes"
			href="/resume"
			icon="fa-arrow-left"
			variant="secondary"
		/>
	</div>

	<div class="mb-8 flex items-start justify-between">
		<div>
			<h1
				class="text-3xl font-bold text-[var(--accent-primary)]"
			>
				{owner_label}<span
					class="text-[var(--text-accent)]"
					>'s resume</span
				>
			</h1>
			<p class="text-sm text-[var(--text-secondary)]">
				last updated {updated_at.toLocaleDateString()}
			</p>
		</div>
		<div class="flex gap-2">
			<Button
				text="full page view"
				href={`/resume/${resume.i}/full_page_view`}
				icon="fa-expand"
			/>
			<Button
				text={viewer_is_owner
					? 'edit'
					: 'view author'}
				href={viewer_is_owner
					? `/resume/${resume.i}/edit`
					: owner_link}
				icon={viewer_is_owner ? 'fa-edit' : undefined}
			/>
		</div>
	</div>

	<div
		class="mx-auto max-w-[21cm] overflow-hidden rounded-lg"
	>
		{#if resume.h}
			<div
				class="rounded-lg bg-[var(--bg-secondary)] p-4"
			>
				<iframe
					srcdoc={resume.h}
					class="mx-auto h-[29.7cm] w-[21cm] rounded border-0"
					title="resume preview"
				></iframe>
			</div>
		{:else}
			<p
				class="text-center text-sm text-[var(--text-secondary)]"
			>
				no resume content yet
			</p>
		{/if}
	</div>
</div>
