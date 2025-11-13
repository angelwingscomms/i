<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import { toast } from '$lib/util/toast.svelte.js';
	import axios from 'axios';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let event: any = $state(data.p);
	let saving = $state(false);

	const saveWithDelay = async () => {
		event.t ??= '';

		saving = true;
		try {
			const formData = new FormData();
			formData.append('t', event.t || '');
			formData.append('b', event.b);
			formData.append('v', event.v ? '.' : '');
			formData.append('c', event.c ? '.' : '');
			if (event.f) formData.append('f', event.f);

			const res = await axios.put(
				`/~/event/${event.i}`,
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				}
			);

			if (res.status === 200) {
				toast.success('Event auto-saved');
			}
		} catch (e) {
			console.error('Auto-save failed:', e);
			toast.error('Failed to auto-save event');
		} finally {
			saving = false;
		}
	};

	$effect(() => {
		JSON.stringify(event);
		saveWithDelay();
	});

	async function immediateSave() {
		await saveWithDelay();
	}

	function goBack() {
		goto(`/~/event/${event.i}`);
	}
</script>

<div class="page pad">
	<div class="row space-between v-center mb-md">
		<h1 class="title">edit event</h1>
		<Button text="view event" onclick={goBack} />
	</div>

	<div class="form">
		<label for="title" class="label">title</label>
		<input
			id="title"
			type="text"
			bind:value={event.t}
			placeholder="event title"
			class="input"
		/>

		<label for="body" class="label">body</label>
		<DescriptionInput
			bind:value={event.b}
			placeholder="event description"
			send={immediateSave}
			send_loading={saving}
		/>
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
