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
	let userTag = '';
	let chatId = '';

	try {
		const pushEvent = event as any;
		const data = pushEvent.data
			? pushEvent.data.json()
			: {};
		userTag = data.userTag || 'someone';
		chatId = data.chatId || '';
	} catch (e) {
		userTag = 'someone';
	}

	const title = `new text from ${userTag}`;
	const options: NotificationOptions = {
		icon: '/icons/icon-192.png',
		data: { chatId, userTag }
	};

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
		event.notification.close();
		const chatId = event.notification.data?.chatId;
		const url = chatId ? `/u/${chatId}` : '/';

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
