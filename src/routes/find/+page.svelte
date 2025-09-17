<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import LiveModal from '$lib/components/LiveModal.svelte';
	import SearchFilters from '$lib/components/u/SearchFilters.svelte';
	import RealtimeKitClient from '@cloudflare/realtimekit';
	import axios from 'axios';
	import { onMount } from 'svelte';

	let meeting: RealtimeKitClient | undefined = $state(undefined);
	let joined = $state(false);
	let maxAge = $state(144);
	let minAge = $state(0);
	let gender = $state<number | undefined>(0);
	let searching = $state(false); // New state variable

	// onMount(() => {
	// 	// No existing onMount logic to preserve, so it's empty
	// });

	const search = async () => {
		searching = true; // Set searching to true when search starts
		let authToken;
		
		try {
			console.log('searching', maxAge, minAge, gender);
			const response = await axios.get('/', {
				params: {
					...(maxAge !== undefined && { x: maxAge }),
					...(minAge !== undefined && { n: minAge }),
					...(gender !== undefined && { g: gender })
				}
			});
			authToken = response.data;
			console.log('authToken', authToken);
		} catch (e) {
			console.error('Failed to get auth token', e);
			searching = false;
			return;
		}

		try {
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
				searching = false; // Stop searching when a participant joins
			});

			meeting.self.on('roomLeft', () => {
				window.location.reload(); //TODO-UX
			});

			// Handle cases where no participant joins after a timeout or error
			// This might require a timeout mechanism or checking for meeting state changes
		} catch (e) {
			console.error('Failed to initialize or join meeting', e);
			searching = false; // Reset searching on error
		}
	};

	const stop_search = async () => {
		searching = false; // Set searching to false
		try {
			await axios.post('/edit_user', { f: 0 }); // Make POST request to set f to 0
		} catch (error) {
			console.error('Error updating user status or leaving meeting:', error);
			// Handle error, maybe show a toast
		}
	};

	$inspect(meeting);
</script>

<svelte:head>
	<title>Apexlinks - Omegle Alternative</title>
	<meta name="description" content="Meet friends like you. Filter by gender" />
</svelte:head>

<div class="flex min-h-screen flex-col items-center justify-center">
	<div class="max-w-2xl px-4 text-center">
		<h1 class="mb-4 text-4xl font-bold" style="color: var(--color-theme-2);">Meet Friends like you</h1>
		<p class="text-accent mb-8 text-xl">
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
			{#if searching && !joined}
				<p class="searching-text">Searching for a match...</p>
			{/if}
			<button
				onclick={() => {
					if (searching) {
						stop_search();
					} else {
						page.data.user ? search() : goto('/google');
					}
				}}
				class="btn-outline group flex items-center gap-3 rounded-full px-6 py-3 font-bold shadow-lg transition-all hover:scale-105 mx-auto"
			>
				{searching ? 'Stop searching' : 'Start searching'}
			</button>
		</div>
	</div>
</div>

{#if joined}
	<LiveModal {meeting} open={true} />
{/if}

<style>
	.searching-text {
		margin-bottom: 1rem;
		font-size: 1.2rem;
		color: var(--text-accent); /* Assuming this is defined in app.css or similar */
	}
</style>