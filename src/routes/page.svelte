<script lang="ts">
	import { onMount } from 'svelte';
	import {page} from "$app/state"
	import LiveModal from '$lib/components/LiveModal.svelte';
	import RealtimeKitClient from '@cloudflare/realtimekit';
	let liveOpen = $state(true);

	let meeting: RealtimeKitClient | undefined = $state(undefined);
	
	onMount(async () => {
		meeting = await RealtimeKitClient.init({
			authToken: page.data.r,
			defaults: {
				audio: true,
				video: true
			}
		});

		meeting.join();
	});
</script>

<LiveModal {meeting} bind:open={liveOpen} />