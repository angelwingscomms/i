import { expect, test } from '@playwright/test';

test.describe('mobile sidebar scrolling', () => {
	test('allows vertical scrolling once content exceeds viewport', async ({ page }) => {
		await page.goto('/~/');
		await page.getByRole('button', { name: 'toggle menu' }).click();
		await expect(page.locator('.mobile-sidebar')).toHaveClass(/is-open/);

		await page.evaluate(() => {
			const nav = document.querySelector('.sidebar-nav');
			if (!nav) return;
			const template = nav.querySelector('a');
			if (!template) return;
			for (let i = 0; i < 25; i += 1) {
				const clone = template.cloneNode(true) as HTMLElement;
				clone.textContent = `extra link ${i}`;
				nav.appendChild(clone);
			}
		});

		const scrollInfo = await page.evaluate(() => {
			const nav = document.querySelector('.sidebar-nav') as HTMLElement | null;
			if (!nav) {
				return { overflowY: null, scrollable: false };
			}
			return {
				overflowY: getComputedStyle(nav).overflowY,
				scrollable: nav.scrollHeight > nav.clientHeight
			};
		});

		expect(scrollInfo.overflowY === 'auto' || scrollInfo.overflowY === 'scroll').toBeTruthy();
		expect(scrollInfo.scrollable).toBeTruthy();
	});
});
