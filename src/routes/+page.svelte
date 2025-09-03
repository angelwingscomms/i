<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import RealtimeKitClient from "@cloudflare/realtimekit";
	import axios from "axios";

	let meeting: RealtimeKitClient | undefined = $state(undefined);

	const search = async () => {
		meeting = await RealtimeKitClient.init({
			authToken: (await axios.get('/')).data,
			defaults: {
				audio: true,
				video: true
			}
		});

		meeting.join();
	};

</script>
<svelte:head>
	<title>AngelWings - Omegle Alternative</title>
	<meta
		name="description"
		content="Meet friends like you. Filter by gender. Safe and friendly chat."
	/>
</svelte:head>

<div
	class="flex min-h-screen flex-col items-center justify-center"
>
	<div class="max-w-2xl px-4 text-center">
		<h1 class="mb-4 text-4xl font-bold text-white-800">A Better Way to Meet Friends</h1>
		<p class="mb-8 text-xl text-white-600">
			Like Omegle, but safer and smarter. Connect with people who share your interests. Filter by
			gender and find meaningful conversations.
		</p>

		<div class="mt-8">
			<button
				onclick="{page.data.user ? search() : goto('/google')}"
				class="group flex items-center gap-3 rounded-full px-6 py-3 font-bold text-white shadow-lg transition-all hover:scale-105"
				style="background: var(--color-theme-2);"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path
						d="M21.35,11.1H12.18V14.89H17.48C17.18,16.89 15.19,18.15 12.18,18.15C9.57,18.15 7.39,15.93 7.39,13.11C7.39,10.29 9.57,8.07 12.18,8.07C13.68,8.07 14.65,8.62 15.32,9.27L18.04,6.64C16.4,5.08 14.07,4 12.18,4C7.4,4 3.53,7.87 3.53,13.11C3.53,18.35 7.4,22.22 12.18,22.22C16.8,22.22 20.25,18.06 20.25,13.11C20.25,12.44 20.19,11.75 20.08,11.1H21.35V11.1Z"
					/>
				</svg>
				Start searching
			</button>
		</div>
	</div>
</div>
