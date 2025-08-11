/// <reference types="vite/client" />
/* global self */

import { clientsClaim } from 'workbox-core';
import {
	cleanupOutdatedCaches,
	createHandlerBoundToURL,
	precacheAndRoute
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';

// Precache manifest injected at build time
// eslint-disable-next-line no-underscore-dangle
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();
clientsClaim();

// SPA navigation fallback to index.html
registerRoute(new NavigationRoute(createHandlerBoundToURL('/')));

self.addEventListener('install', (event: ExtendableEvent) => {
	self.skipWaiting();
});

self.addEventListener('activate', (event: ExtendableEvent) => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event: PushEvent) => {
	let data: any = {};
	try {
		data = event.data ? event.data.json() : {};
	} catch (_) {
		try {
			// @ts-ignore - text may not exist on some user agents
			data = JSON.parse(event.data?.text() || '{}');
		} catch (_) {
			data = {};
		}
	}

	const title = data.title || 'Notification';
	const options: NotificationOptions = {
		body: data.body || '',
		icon: data.icon || '/icons/icon-192.png',
		badge: data.badge || '/icons/icon-192.png',
		tag: data.tag,
		data: data.data || {}
	};

	event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event: any) => {
	event.notification.close();
	const url = event.notification?.data?.url || '/';
	event.waitUntil(
		(async () => {
			const allClients = await self.clients.matchAll({ includeUncontrolled: true, type: 'window' });
			const client: any = allClients.find((c: any) => c.url.includes(url));
			if (client) {
				client.focus();
			} else {
				await self.clients.openWindow(url);
			}
		})()
	);
});
