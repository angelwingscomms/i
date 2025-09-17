<script lang="ts">
	import { onMount } from 'svelte';
	import { ensurePushSubscribed } from '$lib/util/notifications';

	let { userId }: { userId?: string } = $props();
	let showBanner = $state(false);
	let isLoading = $state(false);

	onMount(async () => {
		if (!userId || typeof window === 'undefined') return;

		// Check if browser supports push notifications
		if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
			console.log('Push notifications not supported in this browser');
			return;
		}

		// Check if notification permissions are already granted
		if (Notification.permission === 'granted') {
			return;
		}

		// Check if we have an existing subscription saved
		try {
			const response = await fetch(`/u/${userId}/push_notifications/check_subscription`);
			const data = await response.json();
			if (data.subscribed) {
				console.log('User already has a push notification subscription');
				return;
			}
		} catch (e) {
			console.log('Error checking subscription status:', e);
		}

		// Show banner if permissions not granted and no subscription
		showBanner = true;
	});

	async function handleAccept() {
		if (!userId || isLoading) return;

		isLoading = true;
		try {
			const result = await ensurePushSubscribed(userId);
			if (result.ok) {
				showBanner = false;
			} else {
				// Handle different failure reasons
				switch (result.reason) {
					case 'denied':
						// User denied permissions - don't show banner again for this session
						showBanner = false;
						break;
					case 'unsupported':
						// Browser doesn't support push notifications
						showBanner = false;
						break;
					case 'error':
						// Error occurred - keep banner visible so user can try again
						// Error toast is already shown by ensurePushSubscribed
						break;
					default:
						// Unknown error - keep banner visible
						break;
				}
			}
		} catch (e) {
			console.error('Error requesting push notification permissions:', e);
			// Keep banner visible so user can try again
		} finally {
			isLoading = false;
		}
	}

	function handleDismiss() {
		showBanner = false;
	}
</script>

{#if showBanner}
	<div
		class="fixed right-0 bottom-0 left-0 z-[2000] bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white shadow-lg"
	>
		<div class="mx-auto flex max-w-4xl items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="flex-shrink-0">
					<svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
						<path
							d="M12 2C10.896 2 10 2.896 10 4V5H6C4.896 5 4 5.896 4 7V19C4 20.104 4.896 21 6 21H18C19.104 21 20 20.104 20 19V7C20 5.896 19.104 5 18 5H14V4C14 2.896 13.104 2 12 2ZM12 4C12.552 4 13 4.448 13 5V6H11V5C11 4.448 11.448 4 12 4ZM6 7H18V19H6V7ZM8 9V11H16V9H8ZM8 13V15H13V13H8Z"
						/>
					</svg>
				</div>
				<div>
					<h3 class="text-lg font-semibold">Stay Connected</h3>
					<p class="text-sm opacity-90">
						Enable push notifications to get updates and never miss important messages.
					</p>
				</div>
			</div>
			<div class="flex items-center gap-2">
				<button
					class="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 focus:outline-none disabled:opacity-50"
					onclick={handleAccept}
					disabled={isLoading}
				>
					{#if isLoading}
						<span class="flex items-center gap-2">
							<svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
									d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
								></path>
							</svg>
							Enabling...
						</span>
					{:else}
						Enable Notifications
					{/if}
				</button>
				<button
					class="rounded-lg border border-white/30 bg-transparent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600 focus:outline-none"
					onclick={handleDismiss}
				>
					Not Now
				</button>
			</div>
		</div>
	</div>
{/if}
