/// <reference types="vite/client" />
/* global self */

// This is required for workbox injectManifest to work properly
self.__WB_MANIFEST = [];

console.log('🔧 Service worker starting...');

// Basic service worker functionality without workbox dependencies
self.addEventListener('install', (event: Event) => {
	console.log('📦 Service worker installing...');
	(self as any).skipWaiting();
});

self.addEventListener('activate', (event: Event) => {
	console.log('🚀 Service worker activating...');
	(event as any).waitUntil(
		(self as any).clients.claim()
	);
});

self.addEventListener('push', (event: Event) => {
	console.log('📱 Push notification received');
	let payload: any = {};
	try {
		const e: any = event as any;
		payload = e.data ? e.data.json() : {};
	} catch (e) {
		payload = {};
	}

	const hasRich = payload && (payload.title || payload.body);
	const title = hasRich
		? payload.title || 'new message'
		: `new text from ${payload.userTag || 'someone'}`;

	const options: NotificationOptions = hasRich
		? {
			body: payload.body,
			icon: payload.icon || '/icons/icon-192.png',
			badge: payload.badge,
			tag: payload.tag,
			data:
				payload.data || {
					chatId: payload.chatId || '',
					userTag: payload.userTag || 'someone',
					url: payload?.data?.url
				},
			actions: payload.actions,
			vibrate: payload.vibrate
		}
		: {
			icon: '/icons/icon-192.png',
			data: {
				chatId: payload.chatId || '',
				userTag: payload.userTag || 'someone'
			}
		};

	(event as any).waitUntil(
		(self as any).registration.showNotification(
			title,
			options
		)
	);
});

self.addEventListener('notificationclick', (event: any) => {
	event.notification.close();
	const data = event.notification.data || {};
	const url = data.url || (data.chatId ? `/u/${data.chatId}` : '/');

	(event as any).waitUntil(
		(async () => {
			const allClients = await (self as any).clients.matchAll({
				includeUncontrolled: true,
				type: 'window'
			});
			const client = allClients.find((c: any) => c.url.includes(url));

			if (client) {
				client.focus();
				client.navigate(url);
			} else {
				await (self as any).clients.openWindow(url);
			}
		})()
	);
});
