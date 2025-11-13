import { expect, test } from '@playwright/test';

test.describe('login routes', () => {
	test('logs in via tenant endpoint', async ({
		page
	}) => {
		const login_paths: string[] = [];

		await page.route('**/~/login', async (route) => {
			const request = route.request();
			expect(request.method()).toBe('PUT');
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					error: 'invalid credentials'
				})
			});
		});

		page.on('request', (request) => {
			const url = request.url();
			if (url.includes('/login')) {
				login_paths.push(new URL(url).pathname);
			}
		});

		await page.goto('/~/login');
		await page
			.getByLabel('username or email')
			.fill('user@example.com');
		await page
			.getByLabel('password')
			.fill('password123');
		await page
			.getByRole('button', { name: 'login' })
			.click();

		await expect
			.poll(() => login_paths.length)
			.toBe(1);
		expect(
			login_paths.every((path) => path === '/~/login')
		).toBe(true);
	});

	test('registers via tenant endpoint', async ({
		page
	}) => {
		const register_paths: string[] = [];

		await page.route('**/~/login', async (route) => {
			const request = route.request();
			expect(request.method()).toBe('POST');
			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				body: JSON.stringify({
					error: 'registration blocked'
				})
			});
		});

		page.on('request', (request) => {
			const url = request.url();
			if (url.includes('/login')) {
				register_paths.push(new URL(url).pathname);
			}
		});

		await page.goto('/~/login');
		await page
			.getByRole('button', { name: 'register' })
			.click();
		await page
			.getByLabel('username')
			.fill('new_user');
		await page
			.getByLabel('email')
			.fill('new@example.com');
		await page
			.getByLabel('password')
			.fill('password123');
		await page
			.getByRole('button', { name: 'register' })
			.click();

		await expect
			.poll(() => register_paths.length)
			.toBe(1);
		expect(
			register_paths.every(
				(path) => path === '/~/login'
			)
		).toBe(true);
	});
});
