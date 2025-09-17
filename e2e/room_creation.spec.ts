import { test, expect } from '@playwright/test';

test.describe('Room Creation', () => {
	test('should allow a user to create a room and redirect to the room page', async ({ page }) => {
		// Mock a logged-in user session if necessary, depending on actual auth flow
		// For now, assuming direct access to /r/c for testing purposes or user is already logged in

		await page.goto('/r/c');

		await expect(page.locator('h1')).toHaveText('Create New Room');

		// Fill in the form
		await page.fill('input[id="room_tag"]', 'My Test Room');
		await page.fill('textarea[id="description"]', 'This is a description for my test room.');

		// Click the create button
		await page.click('button[type="submit"]');

		// Expect successful toast notification
		await expect(page.locator('.toast-success')).toBeVisible();
		await expect(page.locator('.toast-success')).toHaveText('Room created successfully!');

		// Expect redirection to the new room's page
		// The URL pattern will be /r/{room_id}
		await expect(page).toHaveURL(/\/r\/[0-9a-fA-F-]+$/);

		// Optionally, verify some content on the room page
		// This part would depend on what the room page displays
		// For example:
		// await expect(page.locator('h1')).toHaveText('My Test Room');
		// await expect(page.locator('.room-description')).toHaveText('This is a description for my test room.');
	});

	test('should display validation errors for empty fields', async ({ page }) => {
		await page.goto('/r/c');

		// Click create button without filling any fields
		await page.click('button[type="submit"]');

		// Expect error messages for required fields
		await expect(page.locator('#room_tag_error')).toHaveText('Room Tag is required.');
		await expect(page.locator('#description_error')).toHaveText('Description is required.');
		await expect(page.locator('.toast-error')).toBeVisible();
		await expect(page.locator('.toast-error')).toHaveText('Please correct the errors in the form.');

		// Fill one field, leave the other empty
		await page.fill('input[id="room_tag"]', 'Partial Room');
		await page.click('button[type="submit"]');

		await expect(page.locator('#room_tag_error')).not.toBeVisible();
		await expect(page.locator('#description_error')).toHaveText('Description is required.');
	});

	test('should display validation errors for exceeding max length', async ({ page }) => {
		await page.goto('/r/c');

		// Fill with long text
		await page.fill('input[id="room_tag"]', 'A'.repeat(51));
		await page.fill('textarea[id="description"]', 'B'.repeat(201));
		await page.click('button[type="submit"]');

		// Expect error messages for max length
		await expect(page.locator('#room_tag_error')).toHaveText(
			'Room Tag must be 50 characters or less.'
		);
		await expect(page.locator('#description_error')).toHaveText(
			'Description must be 200 characters or less.'
		);
		await expect(page.locator('.toast-error')).toBeVisible();
	});
});
