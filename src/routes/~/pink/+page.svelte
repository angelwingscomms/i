<script lang="ts">
	import { fade } from 'svelte/transition';
	import SearchPresets from '$lib/components/pink/SearchPresets.svelte';
	import axios from 'axios';

	type Preset = {
		i: string;
		n: string;
		p?: string;
		a?: string;
		d?: number;
		x?: string[];
	};

	let prompt = $state('');
	let files: FileList | null = $state(null);
	let uploaded_urls = $state<string[]>([]);
	let generating = $state(false);
	let generated_images = $state<string[]>([]);
	let generated_text = $state('');
	let show_presets = $state(false);
	let selected_preset: Preset | null = $state(null);
	let match_images = $state(true);
	let error = $state('');

	async function upload_files(): Promise<string[]> {
		if (!files || files.length === 0) return [];
		const fd = new FormData();
		Array.from(files).forEach((f) =>
			fd.append('files', f)
		);
		const res = await fetch('/items/upload', {
			method: 'POST',
			body: fd
		});
		if (!res.ok) return [];
		const { x } = (await res.json()) as {
			x: string[];
		};
		return x || [];
	}

	async function generate() {
		error = '';
		generated_images = [];
		generated_text = '';
		try {
			if (selected_preset && match_images) {
				const need = selected_preset.x?.length ?? 0;
				const have = uploaded_urls.length;
				if (need > 0 && need !== have) {
					error = `Please upload exactly ${need} image${need === 1 ? '' : 's'} to match preset.`;
					return;
				}
			}

			generating = true;
			// Ensure files are uploaded
			if (
				files &&
				files.length > 0 &&
				uploaded_urls.length !== (files?.length || 0)
			) {
				uploaded_urls = await upload_files();
			}

			const body: Record<string, unknown> = {
				prompt:
					prompt.trim() || selected_preset?.p || '',
				x: uploaded_urls,
				m: match_images,
				pid: selected_preset?.i
			};
			const { data } = await axios.post(
				'/pink/generate',
				body
			);
			generated_images = data.images || [];
			generated_text = data.text || '';
		} catch (e) {
			error = 'Failed to generate images. Try again.';
		} finally {
			generating = false;
		}
	}

	function on_select_preset(p: Preset) {
		selected_preset = p;
		show_presets = false;
	}
</script>

<div class="page pad">
	<h1 class="title">pink: image generator</h1>

	<div class="card gap" in:fade>
		<label class="label" for="prompt">prompt</label>
		<textarea
			id="prompt"
			class="input-underline"
			rows="3"
			bind:value={prompt}
			placeholder="Describe what to generate..."
		></textarea>

		<div class="row gap v-center">
			<button
				class="btn"
				onclick={() => (show_presets = true)}
				>search presets</button
			>
			{#if selected_preset}
				<div class="badge">{selected_preset.n}</div>
				<a
					class="link"
					href={`/pink/preset/${selected_preset.i}`}
					>open</a
				>
			{/if}
		</div>

		<div class="row v-center gap">
			<label class="toggle">
				<input
					type="checkbox"
					bind:checked={match_images}
				/>
				<span>match preset images</span>
			</label>
		</div>

		<label class="label" for="file-upload"
			>images</label
		>
		<input
			id="file-upload"
			type="file"
			multiple
			accept="image/*"
			onchange={(e) =>
				(files = (e.target as HTMLInputElement)
					.files)}
		/>

		{#if selected_preset && match_images}
			<p class="muted">
				Preset expects {selected_preset.x?.length ??
					0} image(s).
			</p>
		{/if}

		<div class="row gap">
			<button
				class="btn-primary"
				onclick={generate}
				disabled={generating}
				>{generating
					? 'generating…'
					: 'generate'}</button
			>
			{#if error}<span class="text-error"
					>{error}</span
				>{/if}
		</div>
	</div>

	{#if generated_images.length || generated_text}
		<div class="card gap" in:fade>
			<h2 class="subtitle">results</h2>
			{#if generated_images.length}
				<div
					class="grid"
					style="display:grid; grid-template-columns: repeat(auto-fill, minmax(180px,1fr)); gap: 12px;"
				>
					{#each generated_images as src, idx}
						<img
							{src}
							alt={`generated-${idx}`}
							style="width:100%; border-radius: 10px; border:1px solid var(--color-theme-6);"
						/>
					{/each}
				</div>
			{/if}
			{#if generated_text}
				<p class="muted">{generated_text}</p>
			{/if}
		</div>
	{/if}
</div>

{#if show_presets}
	<SearchPresets
		asModal
		bind:open={show_presets}
		onSelect={on_select_preset}
	/>
{/if}

<style>
	.toggle {
		display: flex;
		align-items: center;
		gap: 8px;
	}
</style>
