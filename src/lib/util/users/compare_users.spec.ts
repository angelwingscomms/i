import { describe, expect, it, vi } from 'vitest';
import { compare_users } from './compare_users';

// Mock the AI SDK
vi.mock('@ai-sdk/google', () => ({
	google: vi.fn(() => ({
		'gemini-2.5-flash': vi.fn()
	}))
}));

vi.mock('ai', () => ({
	generateText: vi.fn()
}));

describe('compare_users', () => {
	it('returns undefined when self user has no description', async () => {
		const self = { t: 'Alice', d: undefined };
		const user = {
			t: 'Bob',
			d: 'Loves hiking and coding'
		};

		const result = await compare_users(self, user);
		expect(result).toBeUndefined();
	});

	it('returns undefined when other user has no description', async () => {
		const self = {
			t: 'Alice',
			d: 'Loves reading and cooking'
		};
		const user = { t: 'Bob', d: undefined };

		const result = await compare_users(self, user);
		expect(result).toBeUndefined();
	});

	it('returns undefined when both users have no description', async () => {
		const self = { t: 'Alice', d: undefined };
		const user = { t: 'Bob', d: undefined };

		const result = await compare_users(self, user);
		expect(result).toBeUndefined();
	});

	it('handles missing GEMINI API key gracefully', async () => {
		// Temporarily unset the env var
		const originalEnv = process.env.GEMINI;
		delete process.env.GEMINI;

		// Reload the module to trigger the missing key error
		const { compare_users: compare_users_no_key } =
			await import('./compare_users');

		const self = {
			t: 'Alice',
			d: 'Loves hiking and coding'
		};
		const user = {
			t: 'Bob',
			d: 'Loves hiking and cooking'
		};

		const result = await compare_users_no_key(
			self,
			user
		);
		expect(result).toBeUndefined();

		// Restore env var
		process.env.GEMINI = originalEnv;
	});
});
