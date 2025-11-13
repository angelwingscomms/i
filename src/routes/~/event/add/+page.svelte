<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import { toast } from '$lib/util/toast.svelte.js';
	import axios from 'axios';
	import { goto } from '$app/navigation';

	let post = $state({
		t: '',
		b: '',
		v: false,
		c: false
	});
	let saving = $state(false);

	async function save() {
		post.t ??= '';

		saving = true;
		try {
			const formData = new FormData();
			formData.append('t', post.t || '');
			formData.append('b', post.b);
			formData.append('v', post.v ? '.' : '');
			formData.append('c', post.c ? '.' : '');

			const res = await axios.post(
				'/event/add',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				}
			);

			if (res.status === 200) {
				toast.success('Post added');
				goto('/~/posts');
			}
		} catch (e) {
			console.error('Save failed:', e);
			toast.error('Failed to add post');
		} finally {
			saving = false;
		}
	}

	function goBack() {
		goto('/~/posts');
	}
</script>

<div class="page pad">
	<div class="row space-between v-center mb-md">
		<h1 class="title">add post</h1>
		<Button text="cancel" onclick={goBack} />
	</div>

	<div class="form">
		<label for="title" class="label">title</label>
		<input
			id="title"
			type="text"
			bind:value={post.t}
			placeholder="post title"
			class="input"
		/>

		<label for="body" class="label">body</label>
		<DescriptionInput
			bind:value={post.b}
			placeholder="post content"
			send={save}
			send_loading={saving}
		/>

		<div class="row">
			<Button
				text="save"
				onclick={save}
				loading={saving}
			/>
		</div>
	</div>
</div>

<style>
	.page {
		max-width: 720px;
		margin: 0 auto;
	}
	.pad {
		padding: 16px;
	}
	.row {
		display: flex;
		gap: 8px;
	}
	.space-between {
		justify-content: space-between;
	}
	.v-center {
		align-items: center;
	}
	.title {
		font-size: 22px;
		font-weight: 700;
	}
	.form {
		display: grid;
		gap: 16px;
	}
	.label {
		font-weight: 600;
	}
	.input {
		padding: 8px 12px;
		border: 1px solid var(--border);
		border-radius: 8px;
	}
</style>
