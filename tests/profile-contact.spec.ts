import { test, expect } from '@playwright/test';

test.describe('profile contact management', () => {
	test('allows adding phones and emails', async ({
		page
	}) => {
		await page.goto('/~/edit_user');

		await Promise.all([
			page
				.getByLabel('phone numbers')
				.getByPlaceholder('enter phone number')
				.fill('+1234567890'),
			page
				.getByLabel('extra emails')
				.getByPlaceholder('enter email')
				.fill('contact@example.com')
		]);

		await page
			.getByLabel('phone numbers')
			.getByRole('button', { name: 'add' })
			.click();
		await expect(
			page.getByText('+1234567890')
		).toBeVisible();

		await page
			.getByLabel('extra emails')
			.getByRole('button', { name: 'add' })
			.click();
		await expect(
			page.getByText('contact@example.com')
		).toBeVisible();

		await page
			.getByRole('button', { name: 'save changes' })
			.click();

		await expect(
			page.getByText('Profile updated successfully')
		).toBeVisible();

		const userTag = await page
			.getByLabel('user tag')
			.inputValue();
		await page.goto(`/${userTag}`);
		await expect(
			page.getByText('+1234567890')
		).toBeVisible();
		await expect(
			page.getByText('contact@example.com')
		).toBeVisible();
	});
});
