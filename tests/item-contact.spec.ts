import { test, expect } from '@playwright/test';

test.describe('item detail contact links', () => {
	test('shows price and whatsapp link when available', async ({ page }) => {
		await page.goto('/~/items/test-item');
		await expect(page.getByText('whatsapp', { exact: true })).toBeVisible();
		await expect(page.getByText('share item', { exact: true })).toBeVisible();
	});
});
