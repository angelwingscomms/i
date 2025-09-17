<script lang="ts">
	import { page } from '$app/state';
	import LiveModal from '$lib/components/LiveModal.svelte';
	import RealtimeKitClient from '@cloudflare/realtimekit';
	import { onMount } from 'svelte';

	console.log('df', page.data.q);
	let meeting: RealtimeKitClient | undefined =
			$state(undefined),
		liveOpen = $state(true);

	onMount(async () => {
		meeting = await RealtimeKitClient.init({
			authToken: page.data.q,
			defaults: {
				audio: false,
				video: false
			}
		});

		meeting.join();
	});
</script>

<LiveModal {meeting} bind:open={liveOpen} />
