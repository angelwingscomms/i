import { test, expect } from '@playwright/test';

// Smoke test for /items/create; in CI without creds we only verify load and minimal interactions

test('item create smoke (loads or redirects to login)', async ({
	page
}) => {
	await page.goto('/~/items/create');
	await expect(page).toHaveURL(
		/\/i\/create|\/google/
	);
});
