<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let character_name = '';
	let character_about = '';
	let character_meta = '';

	function to_edit_world() {
		goto(`/worlds/${data.w.i}/edit`);
	}

	function render_entries(
		input?: Record<string, unknown>
	) {
		if (!input) return [];
		return Object.entries(input);
	}
</script>

<svelte:head>
	<title>{data.w.n}</title>
</svelte:head>

<div class="mx-auto w-full max-w-5xl px-4 py-8">
	<div class="flex flex-col gap-6">
		<section
			class="rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-6"
		>
			<div
				class="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"
			>
				<div>
					<p
						class="text-sm tracking-wide text-[var(--text-secondary)] uppercase"
					>
						world
					</p>
					<h1
						class="text-2xl font-semibold text-[var(--color-theme-4)]"
					>
						{data.w.n}
					</h1>
					{#if data.w.a}
						<p
							class="mt-2 text-sm text-[var(--text-secondary)]"
						>
							{data.w.a}
						</p>
					{/if}
					{#if data.w.j}
						<div
							class="mt-3 grid gap-2 text-xs text-[var(--text-secondary)]"
						>
							{#each Object.entries(data.w.j) as [key, value]}
								<div
									class="flex items-start justify-between gap-3"
								>
									<span
										class="font-medium text-[var(--color-theme-4)]"
										>{key}</span
									>
									<span class="truncate text-right"
										>{JSON.stringify(value)}</span
									>
								</div>
							{/each}
						</div>
					{/if}
				</div>
				<button
					onclick={to_edit_world}
					type="button"
					class="self-start rounded-full border border-[var(--border-primary)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--color-theme-1)] hover:text-[var(--color-theme-1)]"
				>
					edit world
				</button>
			</div>
			<div
				class="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]"
			>
				{#if data.w.d}
					<span
						>created {new Date(
							data.w.d
						).toLocaleString()}</span
					>
				{/if}
				{#if data.c.length}
					<span>{data.c.length} characters</span>
				{/if}
				{#if data.v.length}
					<span>{data.v.length} environments</span>
				{/if}
			</div>
		</section>

		<section
			class="rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-6"
		>
			<div
				class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
			>
				<h2
					class="text-lg font-semibold text-[var(--color-theme-4)]"
				>
					characters
				</h2>
				<div
					class="flex flex-wrap items-center gap-3"
				>
					<form
						method="POST"
						action="?/generate_character"
						use:enhance
						class="contents"
					>
						<button
							type="submit"
							class="rounded-full border border-[var(--color-theme-1)] px-4 py-2 text-xs font-medium text-[var(--color-theme-1)] transition hover:bg-[var(--color-theme-1)] hover:text-white"
						>
							generate
						</button>
					</form>
					<form
						method="POST"
						action="?/create_character"
						use:enhance
						class="flex flex-col gap-3 md:flex-row md:items-end"
					>
						<div class="flex-1">
							<DescriptionInput
								name="n"
								label="name"
								bind:value={character_name}
								placeholder="character name"
								voice_typing={false}
							/>
						</div>
						<div class="flex-1">
							<DescriptionInput
								name="a"
								label="about"
								bind:value={character_about}
								placeholder="about this character"
								voice_typing={false}
							/>
						</div>
						<div class="flex-1">
							<DescriptionInput
								name="j"
								label="metadata"
								bind:value={character_meta}
								placeholder="&#123;&quot;age&quot;: &quot;17&quot;&#125;"
								voice_typing={false}
							/>
						</div>
						<button
							type="submit"
							class="rounded-full border border-[var(--border-primary)] px-4 py-2 text-xs font-medium text-[var(--text-secondary)] transition hover:border-[var(--color-theme-1)] hover:text-[var(--color-theme-1)]"
						>
							add
						</button>
					</form>
				</div>
			</div>
			{#if data.c.length > 0}
				<ul class="space-y-4">
					{#each data.c as character (character.i)}
						<li
							class="rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-5"
						>
							<h3
								class="text-sm font-semibold text-[var(--color-theme-4)]"
							>
								{character.n}
							</h3>
							{#if character.a}
								<p
									class="mt-2 text-sm text-[var(--text-secondary)]"
								>
									{character.a}
								</p>
							{/if}
							{#if character.j}
								<div
									class="mt-3 space-y-1 text-xs text-[var(--text-secondary)]"
								>
									{#each render_entries(character.j) as [key, value]}
										<div
											class="flex justify-between gap-3"
										>
											<span
												class="font-medium text-[var(--color-theme-4)]"
												>{key}</span
											>
											<span
												class="truncate text-right"
												>{JSON.stringify(value)}</span
											>
										</div>
									{/each}
								</div>
							{/if}
							{#if character.d}
								<p
									class="mt-3 text-xs text-[var(--text-secondary)]"
								>
									created {new Date(
										character.d
									).toLocaleString()}
								</p>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p
					class="rounded-3xl border border-dashed border-[var(--border-primary)] px-4 py-10 text-center text-sm text-[var(--text-secondary)]"
				>
					no characters yet
				</p>
			{/if}
		</section>

		<section
			class="rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-6"
		>
			<div
				class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
			>
				<h2
					class="text-lg font-semibold text-[var(--color-theme-4)]"
				>
					environments
				</h2>
				<form
					method="POST"
					action="?/generate_environment"
					use:enhance
				>
					<button
						type="submit"
						class="rounded-full border border-[var(--color-theme-1)] px-4 py-2 text-xs font-medium text-[var(--color-theme-1)] transition hover:bg-[var(--color-theme-1)] hover:text-white"
					>
						generate
					</button>
				</form>
			</div>
			{#if data.v.length > 0}
				<ul class="space-y-4">
					{#each data.v as environment (environment.i)}
						<li
							class="rounded-3xl border border-[var(--border-primary)] bg-[var(--bg-card)] p-5"
						>
							<h3
								class="text-sm font-semibold text-[var(--color-theme-4)]"
							>
								{environment.n}
							</h3>
							{#if environment.a}
								<p
									class="mt-2 text-sm text-[var(--text-secondary)]"
								>
									{environment.a}
								</p>
							{/if}
							{#if environment.j}
								<div
									class="mt-3 space-y-1 text-xs text-[var(--text-secondary)]"
								>
									{#each render_entries(environment.j) as [key, value]}
										<div
											class="flex justify-between gap-3"
										>
											<span
												class="font-medium text-[var(--color-theme-4)]"
												>{key}</span
											>
											<span
												class="truncate text-right"
												>{JSON.stringify(value)}</span
											>
										</div>
									{/each}
								</div>
							{/if}
							{#if environment.d}
								<p
									class="mt-3 text-xs text-[var(--text-secondary)]"
								>
									created {new Date(
										environment.d
									).toLocaleString()}
								</p>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p
					class="rounded-3xl border border-dashed border-[var(--border-primary)] px-4 py-10 text-center text-sm text-[var(--text-secondary)]"
				>
					no environments yet
				</p>
			{/if}
		</section>
	</div>
</div>
