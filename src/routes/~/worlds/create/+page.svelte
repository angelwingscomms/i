<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';

	let name_value = '';
	let about_value = '';
	let meta_value = '';
</script>

<svelte:head>
	<title>create world</title>
</svelte:head>

<div class="mx-auto w-full max-w-2xl px-4 py-8">
	<h1
		class="mb-6 text-2xl font-semibold text-[var(--color-theme-4)]"
	>
		create world
	</h1>

	<form method="POST" use:enhance class="space-y-6">
		<DescriptionInput
			id="n"
			name="n"
			label="name"
			bind:value={name_value}
			placeholder="world name"
			voice_typing={false}
		/>
		<DescriptionInput
			id="a"
			name="a"
			label="about"
			bind:value={about_value}
			rows={6}
			placeholder="describe the world"
			voice_typing={false}
		/>
		<DescriptionInput
			id="j"
			name="j"
			label="metadata json (optional)"
			bind:value={meta_value}
			rows={4}
			placeholder="&#123;&quot;genre&quot;: &quot;sci-fi&quot;&#125;"
			voice_typing={false}
		/>
		<div class="flex items-center gap-3">
			<button
				type="submit"
				class="rounded-full border border-[var(--color-theme-1)] px-5 py-2 text-sm font-medium text-[var(--color-theme-1)] transition hover:bg-[var(--color-theme-1)] hover:text-white"
			>
				create world
			</button>
			<a
				href="/~/worlds"
				class="rounded-full border border-[var(--border-primary)] px-5 py-2 text-sm text-[var(--text-secondary)] transition hover:border-[var(--color-theme-1)] hover:text-[var(--color-theme-1)]"
			>
				cancel
			</a>
		</div>
	</form>

	{#if $page?.form?.e}
		<p
			class="mt-4 rounded-3xl border border-[var(--accent-alert)] px-4 py-3 text-sm text-[var(--accent-alert)]"
		>
			{$page.form.e}
		</p>
	{/if}
</div>
