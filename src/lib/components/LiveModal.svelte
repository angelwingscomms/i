<script lang="ts">
	import RealtimeKitClient from '@cloudflare/realtimekit';
	import { onMount } from 'svelte';
	import Modal from './Modal.svelte';
	let { authToken, open = $bindable() } = $props();

	let meeting: RealtimeKitClient | undefined = $state(undefined);

	console.log('authToken', authToken);

	onMount(async () => {
		meeting = await RealtimeKitClient.init({
			authToken,
			defaults: {
				audio: true,
				video: true
			}
		});
	});
</script>

<Modal bind:open>
	hii
	<rtk-meeting {meeting} id="my-meeting"></rtk-meeting>
</Modal>
