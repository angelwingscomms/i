import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const component_path = fileURLToPath(
	new URL('./+page.svelte', import.meta.url)
);

describe('~/login form fetch paths', () => {
	it('uses tenant-scoped endpoint for login and registration', () => {
		const content = readFileSync(
			component_path,
			'utf8'
		);
		const login_count =
			content.split("fetch('/~/login'").length - 1;
		expect(login_count).toBeGreaterThanOrEqual(2);
		expect(content.includes("fetch('/login'")).toBe(
			false
		);
	});
});
