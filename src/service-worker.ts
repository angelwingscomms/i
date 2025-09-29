/// <reference types="vite/client" />
/* global self */

// This is required for workbox injectManifest to work properly
self.__WB_MANIFEST = [];

console.debug('[PUSH DEBUG] Service worker starting');

// Basic service worker functionality without workbox dependencies
self.addEventListener('install', (event: Event) => {
	console.debug('[PUSH DEBUG] SW installing');
	(self as any).skipWaiting();
});

self.addEventListener('activate', (event: Event) => {
	console.debug('[PUSH DEBUG] SW activating');
	(event as any).waitUntil(
		(self as any).clients.claim()
	);
});

self.addEventListener('push', (event: Event) => {
	console.debug(
		'[PUSH DEBUG] Push notification received'
	);
	let payload: any = {};
	try {
		const e: any = event as any;
		payload = e.data ? e.data.json() : {};
		console.debug(
			'[PUSH DEBUG] Push payload keys:',
			Object.keys(payload)
		);
		console.debug(
			'[PUSH DEBUG] Push payload data:',
			payload
		);
	} catch (e) {
		console.debug(
			'[PUSH DEBUG] Push payload parse error:',
			e
		);
		payload = {};
	}

	const hasRich =
		payload && (payload.title || payload.body);
	const title = hasRich
		? payload.title || 'new message'
		: `new text from ${payload.userTag || 'someone'}`;

	const options: NotificationOptions = hasRich
		? {
				body: payload.body,
				icon: payload.icon || '/icons/icon-192.png',
				badge: payload.badge,
				tag: payload.tag,
				data: payload.data || {
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

	console.debug(
		'[PUSH DEBUG] Showing notification: title=',
		title,
		'options keys=',
		Object.keys(options)
	);
	(event as any).waitUntil(
		(self as any).registration.showNotification(
			title,
			options
		)
	);
});

self.addEventListener(
	'notificationclick',
	(event: any) => {
		console.debug(
			'[PUSH DEBUG] Notification clicked, data:',
			event.notification.data
		);
		event.notification.close();
		const data = event.notification.data || {};
		const url =
			data.url ||
			(data.chatId ? `/u/${data.chatId}` : '/');
		console.debug(
			'[PUSH DEBUG] Navigating to url:',
			url
		);

		(event as any).waitUntil(
			(async () => {
				const allClients = await (
					self as any
				).clients.matchAll({
					includeUncontrolled: true,
					type: 'window'
				});
				const client = allClients.find((c: any) =>
					c.url.includes(url)
				);

				if (client) {
					client.focus();
					client.navigate(url);
				} else {
					await (self as any).clients.openWindow(url);
				}
			})()
		);
	}
);
