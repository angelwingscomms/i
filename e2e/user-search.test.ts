import { test, expect } from '@playwright/test';

test.describe('User Search and Comparison', () => {
	test('should allow a user to search for another user and see their comparison', async ({
		page
	}) => {
		// Navigate to the home page
		await page.goto('/');

		// Mock the user search API response
		await page.route('/api/search/user?q=testuser', (route) => {
			route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					results: [
						{
							id: '123',
							payload: { u: 'testuser' }
						}
					]
				})
			});
		});

		// Fill in the search box and click search
		await page.fill('input[type="text"]', 'testuser');
		await page.click('button[type="submit"]');

		// Wait for the search results to appear and click on the user link
		await page.waitForSelector('a[href="/u/testuser"]');
		await page.click('a[href="/u/testuser"]');

		// Mock the comparison API response
		await page.route('/api/compare?user1=&user2=testuser', (route) => {
			route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify(['- Both enjoy hiking', '- Both are software engineers'])
			});
		});

		// Check if the comparison page is loaded correctly
		await page.waitForSelector('h1:has-text("Comparison with testuser")');
		await expect(page.locator('h2:has-text("You have in common:")')).toBeVisible();
		await expect(page.locator('li:has-text("Both enjoy hiking")')).toBeVisible();
		await expect(page.locator('li:has-text("Both are software engineers")')).toBeVisible();
	});
});
