<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import LiveModal from '$lib/components/LiveModal.svelte';
	import SearchFilters from '$lib/components/u/SearchFilters.svelte';
	import RealtimeKitClient from '@cloudflare/realtimekit';
	import axios from 'axios';
	import { onMount } from 'svelte';

	let meeting: RealtimeKitClient | undefined = $state(undefined),
		joined = $state(false),
		maxAge = $state(144),
		minAge = $state(0),
		gender = $state<number | undefined>(0);

	onMount(() => {
		if (meeting) {
		}
	});

	const search = async () => {
		const { data: authToken } = await axios.get('/', {
			params: { x: maxAge, n: minAge, g: gender }
		});
		console.log('authToken', authToken);
		meeting = await RealtimeKitClient.init({
			authToken,
			defaults: {
				audio: true,
				video: true
			}
		});

		meeting.join();

		meeting.participants.joined.on('participantJoined', (participant) => {
			
			joined = true;
		});
	};

	$inspect(meeting);
</script>

<svelte:head>
	<title>Apexlinks - Omegle Alternative</title>
	<meta name="description" content="Meet friends like you. Filter by gender" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center">
	<div class="max-w-2xl px-4 text-center">
		<h1 class="text-white-800 mb-4 text-4xl font-bold">Meet Friends like you</h1>
		<p class="text-white-600 mb-8 text-xl">
			like Omegle. connect with people who share your interests. Filter by gender and age
		</p>

		<SearchFilters
			lock_more
			bind:minAge
			bind:maxAge
			bind:gender
			description=""
			loading
			{search}
			sort="match"
			sort_open
		/>

		<div class="mt-8">
			<button
				onclick={() => {
					page.data.user ? search() : goto('/google');
				}}
				class="group flex items-center gap-3 rounded-full px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
				style="background: var(--color-theme-2);"
			>
				Start searching
			</button>
		</div>
	</div>
</div>

{#if joined}
	<LiveModal {meeting} open={true} />
{/if}
