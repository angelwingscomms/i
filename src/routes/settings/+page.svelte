<script lang="ts">
	import { ensurePushSubscribed } from '$lib/util/notifications';
	import { toast } from '$lib/util/toast';

	let { data }: { data: { userId: string } } = $props();
	let isEnabling = $state(false);

	async function enableNotifications() {
		if (!data?.userId || isEnabling) return;
		isEnabling = true;
		try {
			const res = await ensurePushSubscribed(data.userId);
			if (res.ok) {
				toast.success('Notifications enabled');
			} else if (res.reason === 'denied') {
				toast.info('Notifications blocked. Enable in your browser settings.');
			} else if (res.reason === 'unsupported') {
				toast.warning('Push notifications not supported in this browser.');
			} else {
				toast.error('Could not enable notifications. Try again.');
			}
		} finally {
			isEnabling = false;
		}
	}
</script>

<main>
	<div class="container-narrow min-h-screen py-8">
		<header class="mb-8 text-center">
			<h1 class="hero-title mb-2">Settings</h1>
			<p class="hero-subtitle">Manage your preferences</p>
		</header>

		<section class="card-normal">
			<h2 class="mb-4 text-lg font-semibold">Notifications</h2>
			<p class="mb-4 text-sm opacity-80">
				Enable push notifications to get updates even when you're not on the site.
			</p>
			<button
				class="btn-primary rounded-full px-5 py-2"
				onclick={enableNotifications}
				disabled={isEnabling}
			>
				{#if isEnabling}
					<span class="flex items-center gap-2">
						<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Enabling...
					</span>
				{:else}
					Enable Notifications
				{/if}
			</button>
		</section>
	</div>
</main>
