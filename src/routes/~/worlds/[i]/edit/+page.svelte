<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	let name_value = data.w.n || '';
	let about_value = data.w.a || '';
	let meta_value = data.w.j
		? JSON.stringify(data.w.j, null, 2)
		: '';
	let saving = false;
	let error_text = '';
	let success_text = '';

	async function on_submit(event: SubmitEvent) {
		event.preventDefault();
		error_text = '';
		success_text = '';
		saving = true;
		let meta: Record<string, unknown> | undefined;
		if (meta_value.trim()) {
			try {
				meta = JSON.parse(meta_value);
			} catch (error) {
				saving = false;
				error_text = 'invalid json';
				return;
			}
		}
		const res = await fetch(`/worlds/${data.w.i}`, {
			method: 'PUT',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				n: name_value,
				a: about_value,
				j: meta
			})
		});
		if (!res.ok) {
			try {
				const body = await res.json();
				error_text = body?.e || 'update failed';
			} catch (error) {
				error_text = 'update failed';
			}
			saving = false;
			return;
		}
		saving = false;
		success_text = 'world updated';
	}
</script>

<svelte:head>
	<title>edit {data.w.n}</title>
</svelte:head>

<div class="mx-auto w-full max-w-2xl px-4 py-8">
	<h1
		class="mb-6 text-2xl font-semibold text-[var(--color-theme-4)]"
	>
		edit world
	</h1>

	<form class="space-y-6" onsubmit={on_submit}>
		<DescriptionInput
			id="n"
			label="name"
			bind:value={name_value}
			placeholder="world name"
			voice_typing={false}
		/>
		<DescriptionInput
			id="a"
			label="about"
			bind:value={about_value}
			rows={6}
			placeholder="describe the world"
			voice_typing={false}
		/>
		<DescriptionInput
			id="j"
			label="metadata json (optional)"
			bind:value={meta_value}
			rows={6}
			placeholder="&#123;&quot;genre&quot;: &quot;sci-fi&quot;&#125;"
			voice_typing={false}
		/>
		<div class="flex items-center gap-3">
			<button
				type="submit"
				disabled={saving}
				class="rounded-full border border-[var(--color-theme-1)] px-5 py-2 text-sm font-medium text-[var(--color-theme-1)] transition hover:bg-[var(--color-theme-1)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
			>
				{saving ? 'saving…' : 'save world'}
			</button>
			<a
				href={`/worlds/${data.w.i}`}
				class="rounded-full border border-[var(--border-primary)] px-5 py-2 text-sm text-[var(--text-secondary)] transition hover:border-[var(--color-theme-1)] hover:text-[var(--color-theme-1)]"
			>
				back
			</a>
		</div>
	</form>

	{#if error_text}
		<p
			class="mt-4 rounded-3xl border border-[var(--accent-alert)] px-4 py-3 text-sm text-[var(--accent-alert)]"
		>
			{error_text}
		</p>
	{/if}
	{#if success_text}
		<p
			class="mt-4 rounded-3xl border border-[var(--color-theme-1)] px-4 py-3 text-sm text-[var(--color-theme-1)]"
		>
			{success_text}
		</p>
	{/if}
</div>
