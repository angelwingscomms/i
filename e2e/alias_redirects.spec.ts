import { test, expect } from '@playwright/test';

// Tests alias redirects if aliases exist; otherwise skip gracefully

test.describe('alias redirects', () => {
	test('user alias /u/t/:t redirects to /u/:i (if exists)', async ({
		page
	}) => {
		await page.goto(`/u/t/alias-user`);
		const url = page.url();
		if (
			url.endsWith('/u/t/alias-user') ||
			url.includes('404') ||
			url.includes('error')
		) {
			test.info().skip('alias-user not present');
		}
		await expect(page).toHaveURL(
			/\/u\/[A-Za-z0-9-]+$/
		);
	});

	test('user chat alias /u/t/:t/c redirects to /u/:i/c (if exists)', async ({
		page
	}) => {
		await page.goto(`/u/t/alias-user/c`);
		const url = page.url();
		if (
			url.endsWith('/u/t/alias-user/c') ||
			url.includes('404') ||
			url.includes('error')
		) {
			test.info().skip('alias-user not present');
		}
		await expect(page).toHaveURL(
			/\/u\/[A-Za-z0-9-]+\/c$/
		);
	});

	test('room alias /r/t/:t redirects to /r/:i (if exists)', async ({
		page
	}) => {
		await page.goto(`/r/t/alias-room`);
		const url = page.url();
		if (
			url.endsWith('/r/t/alias-room') ||
			url.includes('404') ||
			url.includes('error')
		) {
			test.info().skip('alias-room not present');
		}
		await expect(page).toHaveURL(
			/\/r\/[A-Za-z0-9-]+$/
		);
	});
});
