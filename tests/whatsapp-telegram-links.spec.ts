import { test, expect } from '@playwright/test';

test.describe('whatsapp and telegram links', () => {
	test('allows adding dedicated whatsapp and telegram links', async ({
		page
	}) => {
		await page.goto('/~/edit_user');

		// Fill in WhatsApp and Telegram links
		await page
			.getByLabel('whatsapp', { exact: true })
			.fill('https://wa.me/1234567890');
		await page
			.getByLabel('telegram', { exact: true })
			.fill('https://t.me/testuser');

		await page
			.getByRole('button', { name: 'save changes' })
			.click();

		await expect(
			page.getByText('Profile updated successfully')
		).toBeVisible();

		// Navigate to profile and verify links are displayed with logos
		const userTag = await page
			.getByLabel('user tag')
			.inputValue();
		await page.goto(`/${userTag}`);

		// Check for WhatsApp link with icon
		await expect(
			page.locator('a:has-text("whatsapp")')
		).toBeVisible();
		await expect(
			page.locator('a:has-text("whatsapp") i.fa-whatsapp')
		).toBeVisible();

		// Check for Telegram link with icon
		await expect(
			page.locator('a:has-text("telegram")')
		).toBeVisible();
		await expect(
			page.locator('a:has-text("telegram") i.fa-telegram')
		).toBeVisible();
	});

	test('replaces generic whatsapp/telegram links in other links section', async ({
		page
	}) => {
		await page.goto('/~/edit_user');

		// Add a WhatsApp link in the other links section
		await page
			.getByRole('button', { name: '+' })
			.click();
		await page
			.getByPlaceholder('enter social media link')
			.fill('https://wa.me/9876543210');

		// Also fill the dedicated WhatsApp field
		await page
			.getByLabel('whatsapp', { exact: true })
			.fill('https://wa.me/1234567890');

		await page
			.getByRole('button', { name: 'save changes' })
			.click();

		await expect(
			page.getByText('Profile updated successfully')
		).toBeVisible();

		// Go back to edit page to verify the generic link was removed
		await page.goto('/~/edit_user');

		// The dedicated WhatsApp field should have our link
		const whatsappInput = page
			.getByLabel('whatsapp', { exact: true });
		await expect(whatsappInput).toHaveValue(
			'https://wa.me/1234567890'
		);

		// The other links should not have the WhatsApp URL anymore
		const otherLinksInputs = page
			.getByPlaceholder('enter social media link')
			.all();
		const otherLinksValues = await Promise.all(
			(await otherLinksInputs).map((input) =>
				input.inputValue()
			)
		);
		expect(
			otherLinksValues.some((val) => val.includes('wa.me'))
		).toBeFalsy();
	});
});
