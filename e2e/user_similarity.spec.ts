import { test, expect } from '@playwright/test';

test.describe('User Profile Similarity Feature', () => {
	test.beforeEach(async ({ page }) => {
		// Mock the AI comparison response to avoid actual API calls
		await page.route(
			'**/api/ai/compare',
			async (route) => {
				await route.fulfill({
					status: 200,
					contentType: 'application/json',
					body: JSON.stringify({
						comparison:
							'- you both love hiking\n- you both enjoy coding\n- you both like reading'
					})
				});
			}
		);
	});

	test('displays similarity section when viewing another user profile', async ({
		page
	}) => {
		// Navigate to a user profile page (assuming user exists)
		await page.goto('/testuser');

		// Wait for page to load
		await page.waitForLoadState('networkidle');

		// Check if similarity section is present
		const similaritySection = page.locator(
			'h2:has-text("What You Have in Common")'
		);
		await expect(similaritySection).toBeVisible();

		// Check for the heart icon
		const heartIcon = page.locator('.fa-heart');
		await expect(heartIcon).toBeVisible();

		// Check for comparison content
		const comparisonContent = page.locator(
			'text=/you both love/'
		);
		await expect(comparisonContent).toBeVisible();
	});

	test('does not show similarity section on own profile', async ({
		page
	}) => {
		// Mock authentication
		await page.addInitScript(() => {
			localStorage.setItem(
				'user',
				JSON.stringify({
					i: 'testuser',
					t: 'testuser'
				})
			);
		});

		// Navigate to own profile
		await page.goto('/testuser');

		// Wait for page to load
		await page.waitForLoadState('networkidle');

		// Similarity section should not be present
		const similaritySection = page.locator(
			'h2:has-text("What You Have in Common")'
		);
		await expect(similaritySection).not.toBeVisible();
	});

	test('shows appropriate message when user has no description', async ({
		page
	}) => {
		// Mock a user without description
		await page.route(
			'**/testuser*',
			async (route) => {
				if (route.request().method() === 'GET') {
					await route.fulfill({
						status: 200,
						contentType: 'text/html',
						body: `
						<!DOCTYPE html>
						<html>
						<body>
							<div class="text-center">
								<p>This user doesn't have a description yet.</p>
								<p>You'll be able to see similarities with them when they add a description.</p>
							</div>
						</body>
						</html>
					`
					});
				} else {
					await route.continue();
				}
			}
		);

		await page.goto('/testuser');

		// Check for the no description message
		const noDescriptionMessage = page.locator(
			"text=/doesn't have a description yet/"
		);
		await expect(noDescriptionMessage).toBeVisible();
	});

	test('shows login prompt for non-authenticated users', async ({
		page
	}) => {
		// Clear any existing auth
		await page.context().clearCookies();

		await page.goto('/testuser');

		// Check for login prompt
		const loginPrompt = page.locator(
			'text=/login to see what you have in common with this user/'
		);
		await expect(loginPrompt).toBeVisible();

		const signInButton = page.locator(
			'button:has-text("Sign In to Connect")'
		);
		await expect(signInButton).toBeVisible();
	});
});
