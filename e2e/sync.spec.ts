import { test, expect } from '@playwright/test';

test.describe('sync workflow', () => {
	test('create project, add markers, autosave, upload audio, export', async ({
		page
	}) => {
		await page.goto('/~/sync');

		await page
			.getByRole('button', { name: 'create sync' })
			.click();

		await expect(page).toHaveURL(
			/\/~\/sync\/[a-z0-9]+$/i,
			{ timeout: 15000 }
		);

		await page
			.getByRole('button', { name: 'play' })
			.click();
		await page
			.getByRole('button', { name: /add marker/i })
			.click();
		await page
			.getByRole('button', { name: /pause/i })
			.click();

		await page.waitForTimeout(3000);
		await page.reload();
		await expect(
			page.locator('text=/1\. [0-9]{2}:[0-9]{2}\./')
		).toHaveCount(1);

		const audioInput = page.locator(
			'input[type="file"][accept="audio/*"]'
		);
		await audioInput.setInputFiles(
			'tests/fixtures/beat.mp3'
		);
		await expect(
			page.locator('text=audio saved')
		).toBeVisible({ timeout: 10000 });

		const [response] = await Promise.all([
			page.waitForResponse(
				(res) =>
					res.url().includes('/export') &&
					res.status() === 200
			),
			page
				.getByRole('button', { name: 'export video' })
				.click()
		]);
		const data = await response.json();
		expect(data.url).toMatch(/^https?:\/\//);
	});
});
