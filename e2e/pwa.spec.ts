import { test, expect } from '@playwright/test';

test.describe('PWA', () => {
	test('has manifest link in head and loads manifest', async ({
		page,
		context
	}) => {
		const respPromise = page.waitForResponse((r) =>
			r.url().endsWith('/manifest.webmanifest')
		);
		await page.goto('/');
		// Check manifest link tag present
		const hasManifestLink = await page
			.locator('head link[rel="manifest"]')
			.count();
		expect(hasManifestLink).toBeGreaterThan(0);

		// Fetch and validate manifest JSON
		const resp = await respPromise;
		expect(resp.ok()).toBeTruthy();
		const manifest = await resp.json();

		expect(typeof manifest.name).toBe('string');
		expect(typeof manifest.short_name).toBe('string');
		expect(manifest.start_url).toBeTruthy();
		expect(manifest.display).toBeTruthy();
		expect(
			Array.isArray(manifest.icons)
		).toBeTruthy();
		// At least one maskable icon recommended
		const hasMaskable = (manifest.icons || []).some(
			(i: any) =>
				(i.purpose || '').includes('maskable')
		);
		expect(hasMaskable).toBeTruthy();
	});

	test('registers a service worker', async ({
		page
	}) => {
		await page.goto('/');
		// Wait for service worker to be ready
		const swController = await page.evaluate(
			async () => {
				// @ts-ignore
				if (!('serviceWorker' in navigator))
					return null;
				const reg =
					await navigator.serviceWorker.ready;
				return {
					scope: reg.scope,
					active: !!reg.active,
					installing: !!reg.installing || false,
					waiting: !!reg.waiting || false
				};
			}
		);
		expect(swController).not.toBeNull();
		expect(
			swController.active ||
				swController.waiting ||
				swController.installing
		).toBeTruthy();
	});

	test('serves offline fallback for navigations when network is cut', async ({
		page,
		context
	}) => {
		await page.goto('/');

		// Give some time for PWA plugin to precache assets and install SW
		await page.waitForTimeout(500);

		// Go offline
		await context.setOffline(true);

		// Navigate to a fresh path to trigger navigateFallback
		const resp = await page.goto(
			'/some-unknown-offline-route-' + Date.now(),
			{
				waitUntil: 'domcontentloaded'
			}
		);

		// Ensure response is successful from service worker (should be offline.html)
		expect(resp).not.toBeNull();
		// Some drivers may mark it as 200 or opaque, so we check content instead
		const content = await page.content();
		expect(content.toLowerCase()).toContain(
			'offline'
		);

		// Back online for cleanliness
		await context.setOffline(false);
	});

	test('caches static assets (icons) via service worker', async ({
		page,
		context
	}) => {
		await page.goto('/');

		// Request one of the PWA icons and ensure it gets cached
		const iconPath = '/icons/icon-192.png';
		const r1 = await page.request.get(iconPath);
		expect(r1.ok()).toBeTruthy();

		// Go offline and try to fetch the icon again (should be served from cache)
		await context.setOffline(true);
		const r2 = await page.request.get(iconPath);
		// When offline, Playwright request API bypasses SW, so instead check `<img>` loading in page context.
		await context.setOffline(false);

		// Validate via in-page fetch which goes through SW
		await page.evaluate(async (src) => {
			const img = new Image();
			img.src = src + '?t=' + Date.now();
			await new Promise((res, rej) => {
				img.onload = () => res(null);
				img.onerror = rej;
			});
		}, iconPath);

		await context.setOffline(true);
		const loadedOffline = await page.evaluate(
			async (src) => {
				const img = new Image();
				img.src = src + '?t=' + Date.now();
				try {
					await new Promise((res, rej) => {
						img.onload = () => res(true);
						img.onerror = () =>
							rej(new Error('error'));
					});
					return true;
				} catch {
					return false;
				}
			},
			iconPath
		);
		expect(loadedOffline).toBeTruthy();
		await context.setOffline(false);
	});
});
