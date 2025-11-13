import { test, expect } from '@playwright/test';

test.describe('profile zone management', () => {
	test('shows zone section in profile edit', async ({
		page
	}) => {
		await page.goto('/~/edit_user');
		await expect(
			page.getByText('zones', { exact: true })
		).toBeVisible();
	});
});
