<script lang="ts">
	let uploading = $state(false);
	let file: File | null = $state(null);
	let errorText = $state('');
	let successId = $state('');

	async function onsubmit(e: Event) {
		e.preventDefault();
		if (!file) {
			errorText = 'Please choose an image file';
			return;
		}
		const fd = new FormData();
		fd.set('file', file);
		uploading = true;
		errorText = '';
		successId = '';
		try {
			const res = await fetch('/m/n', { method: 'POST', body: fd });
			if (!res.ok) throw new Error(await res.text());
			const { id } = await res.json();
			successId = id;
		} catch (e) {
			errorText = 'Upload failed';
		} finally {
			uploading = false;
		}
	}

	function onfile(e: Event) {
		const input = e.target as HTMLInputElement;
		const f = input.files?.[0] || null;
		if (!f) return (file = null);
		if (!f.type.startsWith('image/')) {
			errorText = 'Only image files are allowed';
			file = null;
			(input.value = ''), input.setAttribute('aria-invalid', 'true');
			return;
		}
		input.removeAttribute('aria-invalid');
		file = f;
	}
</script>

<div class="page pad">
	<h1 class="title">upload meme</h1>

	<form class="card gap" onsubmit={onsubmit} aria-label="Upload meme">
		<label class="label" for="meme_file">choose image</label>
		<input id="meme_file" type="file" accept="image/*" onchange={onfile} />
		<button class="btn-primary" disabled={uploading || !file} aria-busy={uploading}>Upload</button>
		{#if errorText}
			<p class="error" role="alert">{errorText}</p>
		{/if}
		{#if successId}
			<p>Uploaded. <a class="link" href={`/r/${successId}`}>Go to comments</a></p>
		{/if}
	</form>
</div>

<style>
	.page { max-width: 720px; margin: 0 auto; }
	.pad { padding: 16px; }
	.card { background: transparent; border: none; }
	.gap { display: grid; gap: 12px; }
	.error { color: #e33; }
</style>

