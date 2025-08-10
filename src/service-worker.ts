/// <reference lib="webworker" />

declare const self: ServiceWorkerGlobalScope;

self.addEventListener('install', (event) => {
	console.log('Service Worker: Installing...');
	self.skipWaiting();
});

self.addEventListener('activate', (event) => {
	console.log('Service Worker: Activating...');
	event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
	// This is a basic fetch handler. You might want to add caching strategies here.
	event.respondWith(fetch(event.request));
});
