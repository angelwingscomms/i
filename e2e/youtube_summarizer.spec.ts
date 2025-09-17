import { test, expect } from '@playwright/test';

// Basic integration smoke test for the tool UI
// Assumes server running via playwright config webServer

test('YouTube summarizer flow', async ({ page }) => {
	await page.goto(
		'/tools/youtube-video-summarize-tool'
	);

	// Page loads
	await expect(
		page.getByRole('heading', {
			name: 'YouTube Video Summarizer'
		})
	).toBeVisible();

	// Enter a query and search
	const input = page.getByPlaceholder(
		'search videos...'
	);
	await input.fill('gemini');
	await input.press('Enter');

	// We don't assert real YouTube results (depends on API keys). Just ensure no crash and grid renders eventually
	await expect(page.locator('.grid')).toBeVisible();
});
