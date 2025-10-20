import { expect, test } from '@playwright/test';

test.describe('toast notifications', () => {
	test('shows toast when navbar install action triggered', async ({ page }) => {
		await page.goto('/~/');

		await page.evaluate(() => {
			window.dispatchEvent(
				new CustomEvent('request-install-app')
			);
		});

		await expect(
			page.locator('[role="alert"]').first()
		).toBeVisible();
	});
});
