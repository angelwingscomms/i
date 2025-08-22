import { PUBLIC_VAPID_KEY } from '$env/static/public';
import { toast } from '../toast';

export async function ensurePushSubscribed(userId: string) {
	if (
		typeof window === 'undefined' ||
		!('serviceWorker' in navigator) ||
		!('PushManager' in window)
	) {
		return { ok: false, reason: 'unsupported' } as const;
	}

	try {
		console.log('🎯 Starting push notification setup...');

		// Check if service worker is available and get registration
		console.log('⏳ Checking service worker registration...');
		if (!('serviceWorker' in navigator)) {
			throw new Error('Service workers not supported');
		}

		let registration = await navigator.serviceWorker.getRegistration();
		if (!registration) {
			console.log('📝 No existing service worker, registering...');
			try {
				registration = await navigator.serviceWorker.register('/service-worker.js');
				console.log('✅ Service worker registered!');
			} catch (error) {
				console.error('❌ Failed to register service worker:', error);
				throw new Error('Service worker registration failed');
			}

			// Wait for it to be ready with timeout
			const readyRegistration = await Promise.race([
				navigator.serviceWorker.ready,
				new Promise<never>((_, reject) =>
					setTimeout(() => reject(new Error('Service worker ready timeout')), 10000)
				)
			]);
			registration = readyRegistration;
		}
		console.log('✅ Service worker ready!');

		let permission = Notification.permission;
		console.log('📋 Current notification permission:', permission);

		if (permission === 'default') {
			console.log('🔐 Requesting notification permission...');
			// Request permission with timeout
			permission = await Promise.race([
				Notification.requestPermission(),
				new Promise<NotificationPermission>((_, reject) =>
					setTimeout(() => reject(new Error('Permission request timeout')), 10000)
				)
			]);
			console.log('📋 New notification permission:', permission);
		}

		if (permission !== 'granted') {
			if (permission === 'denied') {
				toast.info('Notifications blocked. Please enable them in your browser settings.');
			} else {
				toast.info('Please enable notifications to stay connected.');
			}
			return { ok: false, reason: 'denied' } as const;
		}

		console.log('🔑 Processing VAPID key...');
		const applicationServerKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);

		console.log('📱 Getting existing subscription...');
		// Try to reuse an existing subscription if present
		const existing = await registration.pushManager.getSubscription();
		console.log('📱 Existing subscription:', existing ? 'found' : 'none');

		console.log('📱 Creating subscription...');
		const sub =
			existing ||
			(await registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey }));
		console.log('📱 Subscription created successfully!');

		// Log subscription creation
		if (!existing) {
			console.log('🔔 Push notification subscription created:', {
				userId,
				endpoint: sub.endpoint,
				keys: sub.getKey ? {
					p256dh: sub.getKey('p256dh') ? 'present' : 'missing',
					auth: sub.getKey('auth') ? 'present' : 'missing'
				} : 'getKey not available',
				timestamp: new Date().toISOString()
			});
		} else {
			console.log('🔄 Reusing existing push notification subscription:', {
				userId,
				endpoint: existing.endpoint,
				timestamp: new Date().toISOString()
			});
		}

		console.log('💾 Saving subscription to server...');
		// Save subscription with timeout
		const saveResponse = await Promise.race([
			fetch(`/u/${userId}/push_notifications/save_subscription`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(sub)
			}),
			new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error('Save subscription timeout')), 5000)
			)
		]);

		if (!saveResponse.ok) {
			throw new Error(`Save subscription failed: ${saveResponse.status}`);
		}

		console.log('✅ Push notification setup completed successfully!');
		return { ok: true } as const;
	} catch (e) {
		console.error('ensurePushSubscribed error', e);

		// Show user-friendly error message
		if (e instanceof Error) {
			if (e.message.includes('timeout')) {
				toast.error('Request timed out. Please try again.');
			} else if (e.message.includes('Service worker')) {
				toast.error('Service worker not ready. Please refresh the page and try again.');
			} else {
				toast.error('Failed to enable notifications. Please try again.');
			}
		} else {
			toast.error('Failed to enable notifications. Please try again.');
		}

		return { ok: false, reason: 'error' } as const;
	}
}

export async function sendPushToUser(userId: string, title: string, body: string, tag?: string) {
	try {
		await fetch(`/u/${userId}/push_notif`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ t: title, m: body, k: tag })
		});
	} catch (e) {
		console.error('sendPushToUser error', e);
	}
}

function urlBase64ToUint8Array(base64String: string) {
	const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
	const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) {
		outputArray[i] = rawData.charCodeAt(i);
	}
	return outputArray;
}
