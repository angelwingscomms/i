<script lang="ts">
	import { toast } from '$lib/util/toast';
	let name = $state('');
	let desc = $state('');
	let kind = $state<0 | 1>(0);
	let files: FileList | null = null;

	async function upload_files(): Promise<string[]> {
		if (!files || files.length === 0) return [];
		const fd = new FormData();
		Array.from(files).forEach((f) => fd.append('files', f));
		const res = await fetch('/i/upload', { method: 'POST', body: fd });
		if (!res.ok) return [];
		const { x } = (await res.json()) as { x: string[] };
		return x || [];
	}

	async function submit() {
		try {
			const x = await upload_files();
			const res = await fetch('/i/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ t: name, d: desc, k: kind, x })
			});
			if (!res.ok) throw new Error('create failed');
			const { i } = await res.json();
			toast.success('item created');
			window.location.href = `/i/${i}`;
		} catch {
			toast.error('failed to create item');
		}
	}
</script>

<div class="page pad">
	<h1 class="title">create item</h1>
	<div class="card gap">
		<input class="input-underline" placeholder="name" bind:value={name} />
		<textarea class="input-underline" placeholder="description" bind:value={desc}></textarea>
		<select class="input-underline" bind:value={kind}>
			<option value={0}>product</option>
			<option value={1}>service</option>
		</select>
		<input type="file" multiple onchange={(e) => (files = (e.target as HTMLInputElement).files)} />
		<button class="btn-primary btn" onclick={submit}>create</button>
	</div>
</div>

