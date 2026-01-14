import { PUBLIC_VAPID_KEY } from '$env/static/public';
import { toast } from '../toast.svelte';
import axios from 'axios';
import { notif_debug } from '$lib/util/notif_debug';

export async function ensurePushSubscribed(
	userId: string
) {
	try {
		if (
			typeof window === 'undefined' ||
			!('serviceWorker' in navigator) ||
			!('PushManager' in window)
		) {
			return {
				ok: false,
				reason: 'unsupported'
			} as const;
		}

		notif_debug(
			`Starting push notification setup for user ${userId}`
		);

		// Check if service worker is available and get registration
		notif_debug(
			'Checking service worker registration'
		);
		if (!('serviceWorker' in navigator)) {
			throw new Error(
				'Service workers not supported'
			);
		}

		let registration =
			await navigator.serviceWorker.getRegistration();
		if (!registration) {
			notif_debug(
				'No existing SW, registering /service-worker.js'
			);
			try {
				registration =
					await navigator.serviceWorker.register(
						'/service-worker.js'
					);
				notif_debug('SW registered successfully');
			} catch (error) {
				console.error(
					'❌ Failed to register service worker:',
					error
				);
				throw new Error(
					'Service worker registration failed'
				);
			}

			// Wait for it to be ready with timeout
			const readyRegistration = await Promise.race([
				navigator.serviceWorker.ready,
				new Promise<never>((_, reject) =>
					setTimeout(
						() =>
							reject(
								new Error(
									'Service worker ready timeout'
								)
							),
						10000
					)
				)
			]);
			registration = readyRegistration;
		}
		notif_debug('SW ready');

		let permission = Notification.permission;
		notif_debug(
			`Current notification permission: ${permission}`
		);

		if (permission === 'default') {
			notif_debug(
				'Requesting notification permission'
			);
			// Request permission with timeout
			permission = await Promise.race([
				Notification.requestPermission(),
				new Promise<NotificationPermission>(
					(_, reject) =>
						setTimeout(
							() =>
								reject(
									new Error(
										'Permission request timeout'
									)
								),
							10000
						)
				)
			]);
			notif_debug(
				`New notification permission: ${permission}`
			);
		}

		if (permission !== 'granted') {
			if (permission === 'denied') {
				toast.info(
					'Notifications blocked. Please enable them in your browser settings.'
				);
			} else {
				toast.info(
					'Please enable notifications to stay connected.'
				);
			}
			return { ok: false, reason: 'denied' } as const;
		}

		notif_debug(
			`VAPID public key loaded: ${PUBLIC_VAPID_KEY ? 'present' : 'missing'}`
		);
		const applicationServerKey =
			urlBase64ToUint8Array(PUBLIC_VAPID_KEY);

		notif_debug('Getting existing subscription');
		// Try to reuse an existing subscription if present
		const existing =
			await registration.pushManager.getSubscription();
		notif_debug(
			`Existing subscription: ${existing ? 'found' : 'none'}`
		);

		notif_debug('Creating or reusing subscription');
		const sub =
			existing ||
			(await registration.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey
			}));
		notif_debug(
			'Subscription created/reused successfully'
		);

		// Log subscription creation
		if (!existing) {
			const p256dh = sub.getKey
				? !!sub.getKey('p256dh')
				: false;
			const auth = sub.getKey
				? !!sub.getKey('auth')
				: false;
			notif_debug(
				`New sub created for ${userId}: endpoint=${sub.endpoint}, keys p256dh=${p256dh}, auth=${auth}`
			);
		} else {
			notif_debug(
				`Reusing sub for ${userId}: endpoint=${existing.endpoint}`
			);
		}

		notif_debug(`Saving sub to server for ${userId}`);
		// Save subscription
		try {
			const response = await axios.post(
				'/~/api/notifications/subscribe',
				sub,
				{ timeout: 5000 }
			);
			notif_debug(
				`Sub saved successfully: ${response.status}`
			);
		} catch (e: any) {
			const errMsg = e.response?.data || e.message;
			notif_debug(
				`Sub save failed for ${userId}: ${errMsg}`
			);
			throw new Error('Save subscription failed');
		}

		notif_debug(`Push setup completed for ${userId}`);
		return { ok: true } as const;
	} catch (e) {
		notif_debug(
			`ensurePushSubscribed error for ${userId}: ${e instanceof Error ? e.message : String(e)}`
		);

		// Show user-friendly error message
		if (e instanceof Error) {
			if (e.message.includes('timeout')) {
				toast.error(
					'Request timed out. Please try again.'
				);
			} else if (
				e.message.includes('Service worker')
			) {
				toast.error(
					'Service worker not ready. Please refresh the page and try again.'
				);
			} else {
				toast.error(
					'Failed to enable notifications. Please try again.'
				);
			}
		} else {
			toast.error(
				'Failed to enable notifications. Please try again.'
			);
		}

		return { ok: false, reason: 'error' } as const;
	}
}

export async function sendPushToUser(
	userId: string,
	title: string,
	body: string,
	tag?: string
) {
	try {
		notif_debug(
			`Sending push to user ${userId}: title="${title}", body="${body}", tag="${tag || ''}"`
		);
		const response = await fetch(
			`/u/${userId}/push_notif`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					t: title,
					m: body,
					k: tag
				})
			}
		);
		if (!response.ok) {
			notif_debug(
				`Send push fetch failed for ${userId}: ${response.status} ${response.statusText}`
			);
		} else {
			notif_debug(
				`Push sent successfully to ${userId}`
			);
		}
	} catch (e) {
		notif_debug(
			`Send push error for ${userId}: ${e instanceof Error ? e.message : String(e)}`
		);
	}
}
export async function unsubscribe_push() {
	if (
		typeof window === 'undefined' ||
		!('serviceWorker' in navigator) ||
		!('PushManager' in window)
	) {
		return {
			ok: false,
			reason: 'unsupported'
		} as const;
	}
	try {
		notif_debug('Starting unsubscribe process');
		const reg =
			await navigator.serviceWorker.getRegistration();
		const sub =
			await reg?.pushManager.getSubscription();
		if (!sub) {
			notif_debug(
				'No subscription found for unsubscribe'
			);
			return {
				ok: false,
				reason: 'not_subscribed'
			} as const;
		}
		notif_debug(
			`Unsubscribing sub with endpoint: ${sub.endpoint}`
		);
		try {
			const response = await axios.post(
				'/~/api/notifications/unsubscribe',
				sub
			);
			notif_debug(
				`Server unsubscribe response: ${response.status}`
			);
		} catch (e: any) {
			const errMsg = e.response?.data || e.message;
			notif_debug(
				`Server unsubscribe failed: ${errMsg}`
			);
		}
		await sub.unsubscribe();
		notif_debug('Client-side unsubscribe completed');
		toast.success('notifications turned off');
		return { ok: true } as const;
	} catch (e) {
		notif_debug(
			`Unsubscribe error: ${e instanceof Error ? e.message : String(e)}`
		);
		return { ok: false, reason: 'error' } as const;
	}
}

function urlBase64ToUint8Array(base64String: string) {
	const padding = '='.repeat(
		(4 - (base64String.length % 4)) % 4
	);
	const base64 = (base64String + padding)
		.replace(/-/g, '+')
		.replace(/_/g, '/');
	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}

export async function refresh_push_subscription() {
	if (
		typeof window === 'undefined' ||
		!('serviceWorker' in navigator) ||
		!('PushManager' in window)
	) {
		return {
			ok: false,
			reason: 'unsupported'
		} as const;
	}
	try {
		notif_debug('Starting subscription refresh');
		const reg =
			await navigator.serviceWorker.getRegistration();
		const sub =
			await reg?.pushManager.getSubscription();
		if (!sub) {
			notif_debug('No subscription for refresh');
			return {
				ok: false,
				reason: 'not_subscribed'
			} as const;
		}
		notif_debug(
			`Refreshing sub with endpoint: ${sub.endpoint}`
		);
		try {
			const response = await axios.post(
				'/~/api/notifications/subscribe',
				sub,
				{ timeout: 5000 }
			);
			notif_debug(
				`Refresh save response: ${response.status}`
			);
		} catch (e: any) {
			const errMsg = e.response?.data || e.message;
			notif_debug(`Refresh save failed: ${errMsg}`);
			return { ok: false, reason: 'error' } as const;
		}
		notif_debug(
			'Subscription refreshed successfully'
		);
		return { ok: true } as const;
	} catch (e) {
		notif_debug(
			`Refresh error: ${e instanceof Error ? e.message : String(e)}`
		);
		return { ok: false, reason: 'error' } as const;
	}
}
