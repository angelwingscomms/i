import { test, expect } from '@playwright/test';
import { create } from '../src/lib/db'; // Adjust path as needed
import { delete_ } from '../src/lib/db'; // Adjust path as needed

test.describe('Room Search', () => {
	let roomId: string;
	let userId: string;

	test.beforeAll(async () => {
		// Create a dummy room
		roomId = await create(
			{
				s: 'r',
				t: 'Test Room Search',
				d: 'A room for testing search'
			},
			'Test Room Search'
		);
		// Create a dummy user
		userId = await create(
			{
				s: 'u',
				t: 'Test User Search',
				d: 'A user for testing search'
			},
			'Test User Search'
		);
	});

	test.afterAll(async () => {
		// Clean up dummy data
		await delete_(roomId);
		await delete_(userId);
	});

	test('should only display chatrooms in search results', async ({
		page
	}) => {
		await page.goto('/~/r');

		// Type search query
		await page.fill(
			'input[placeholder="Search chatrooms..."]',
			'Test Search'
		);

		// Click search button
		await page.click('button:has-text("search")');

		// Wait for results to load
		await page.waitForSelector('.list');

		// Get all result links
		const resultLinks = await page
			.locator('.list a')
			.all();

		// Assert that only room links are present
		for (const link of resultLinks) {
			const href = await link.getAttribute('href');
			expect(href).toMatch(/^\/r\/[0-9a-fA-F-]+$/); // Should match /r/{room_id}
		}

		// Assert that the specific test room is found
		await expect(
			page.locator(`.list a[href="/~/r/${roomId}"]`)
		).toBeVisible();

		// Assert that the specific test user is NOT found
		await expect(
			page.locator(`.list a[href="/~/u/${userId}"]`)
		).not.toBeVisible();
	});
});
