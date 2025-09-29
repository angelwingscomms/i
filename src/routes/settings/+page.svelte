<script lang="ts">
	import {
		ensurePushSubscribed,
		unsubscribe_push
	} from '$lib/util/notifications';
	import { toast } from '$lib/util/toast.svelte';
	import { onMount } from 'svelte';
	import { refresh_push_subscription } from '$lib/util/notifications';

	let { data }: { data: { userId: string } } =
		$props();
	let isRefreshing = $state(false);
	let sub_status = $state<
		'unknown' | 'on' | 'off' | 'unsupported'
	>('unknown');

	async function checkSubscription() {
		if (
			typeof window === 'undefined' ||
			!('serviceWorker' in navigator) ||
			!('PushManager' in window)
		) {
			sub_status = 'unsupported';
			return;
		}
		try {
			const reg =
				await navigator.serviceWorker.getRegistration();
			const sub =
				await reg?.pushManager.getSubscription();
			sub_status = sub ? 'on' : 'off';
		} catch (e) {
			console.error(e);
			sub_status = 'off';
		}
	}

	onMount(() => {
		checkSubscription();
	});

	let isEnabling = $state(false);
	let isDisabling = $state(false);

	async function enableNotifications() {
		if (!data?.userId || isEnabling) return;
		isEnabling = true;
		try {
			const res = await ensurePushSubscribed(
				data.userId
			);
			if (res.ok) {
				toast.success('notifications enabled');
			} else if (res.reason === 'denied') {
				toast.info(
					'notifications blocked. enable in your browser settings.'
				);
			} else if (res.reason === 'unsupported') {
				toast.warning(
					'push notifications not supported in this browser.'
				);
			} else {
				toast.error(
					'could not enable notifications. try again.'
				);
			}
		} finally {
			isEnabling = false;
			checkSubscription();
		}
	}

	async function refreshSubscription() {
		if (isRefreshing) return;
		isRefreshing = true;
		try {
			const res = await refresh_push_subscription();
			if (res.ok) {
				toast.success('subscription refreshed');
			} else if (res.reason === 'not_subscribed') {
				toast.info('you are not subscribed');
			} else if (res.reason === 'unsupported') {
				toast.warning(
					'not supported in this browser'
				);
			} else {
				toast.error('could not refresh subscription');
			}
		} finally {
			isRefreshing = false;
			checkSubscription();
		}
	}

	async function disableNotifications() {
		if (isDisabling) return;
		isDisabling = true;
		try {
			const res = await unsubscribe_push();
			if (res.ok) {
				toast.success('notifications turned off');
			} else if (res.reason === 'not_subscribed') {
				toast.info('you are not subscribed');
			} else if (res.reason === 'unsupported') {
				toast.warning(
					'not supported in this browser'
				);
			} else {
				toast.error(
					'could not turn off notifications'
				);
			}
		} finally {
			isDisabling = false;
			checkSubscription();
		}
	}
</script>

<main>
	<div class="container-narrow min-h-screen py-8">
		<header class="mb-8 text-center">
			<h1 class="hero-title mb-2">settings</h1>
			<p class="hero-subtitle">
				manage your preferences
			</p>
		</header>

		<section class="card-normal">
			<h2 class="mb-4 text-lg font-semibold">
				notifications
			</h2>
			<p class="mb-4 text-sm opacity-80">
				enable push notifications to get updates even
				when you're not on the site.
			</p>
			<div class="mb-4 flex items-center gap-3">
				<span class="text-sm opacity-70">status:</span
				>
				{#if sub_status === 'on'}
					<span
						class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700"
						>on</span
					>
				{:else if sub_status === 'off'}
					<span
						class="rounded-full bg-neutral-200 px-2.5 py-1 text-xs text-neutral-700"
						>off</span
					>
				{:else if sub_status === 'unsupported'}
					<span
						class="rounded-full bg-amber-100 px-2.5 py-1 text-xs text-amber-800"
						>unsupported</span
					>
				{:else}
					<span
						class="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600"
						>checking...</span
					>
				{/if}
				<button
					class="rounded-full border border-neutral-300 px-3 py-1 text-xs disabled:opacity-50 dark:border-neutral-700"
					onclick={refreshSubscription}
					disabled={isRefreshing}
				>
					{#if isRefreshing}
						refreshing...
					{:else}
						refresh subscription
					{/if}
				</button>
			</div>

			<div class="flex items-center gap-3">
				<button
					class="rounded-full bg-black px-5 py-2 text-white disabled:opacity-50 dark:bg-white dark:text-black"
					onclick={enableNotifications}
					disabled={isEnabling}
				>
					{#if isEnabling}
						<span class="flex items-center gap-2">
							<svg
								class="h-4 w-4 animate-spin"
								viewBox="0 0 24 24"
								fill="none"
							>
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
							enabling...
						</span>
					{:else}
						enable notifications
					{/if}
				</button>
				<button
					class="rounded-full border border-neutral-300 px-5 py-2 text-sm disabled:opacity-50 dark:border-neutral-700"
					onclick={disableNotifications}
					disabled={isDisabling}
				>
					{#if isDisabling}
						<span class="flex items-center gap-2">
							<svg
								class="h-4 w-4 animate-spin"
								viewBox="0 0 24 24"
								fill="none"
							>
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
							disabling...
						</span>
					{:else}
						turn off notifications
					{/if}
				</button>
			</div>
		</section>
	</div>
</main>
