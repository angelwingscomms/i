import { expect, test } from '@playwright/test';

test('granite chat loads with fallback state', async ({ page }) => {
	await page.goto('/~/chat/g');
	await expect(page.getByRole('heading', { name: 'granite in-browser chat' })).toBeVisible();
	const fallback = page.getByText('webgpu support required');
	const loading = page.getByText('loading granite weights');
	if (!(await fallback.isVisible())) {
		await expect(loading).toBeVisible();
	}
});
