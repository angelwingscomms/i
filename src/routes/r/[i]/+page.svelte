<script lang="ts">
	import Chat from '$lib/components/Chat.svelte';
	import type { PageProps } from './$types';
	import { toast } from '$lib/util/toast';

	let { data }: PageProps = $props();

	async function save_room() {
		try {
			const response = await fetch(`/r/${data.i}/save`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				toast.success('Room saved!');
			} else {
				const error_data = await response.json();
				toast.error(error_data.message || 'Failed to save room.');
			}
		} catch (error) {
			console.error('Error saving room:', error);
			toast.error('An unexpected error occurred.');
		}
	}
</script>

<div class="save-room-container">
	<button class="btn btn-primary" onclick={save_room}>Save Room</button>
</div>

<Chat m={data.m} c={data.c} s={data.s} t={data.t} />
