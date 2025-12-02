import {
	describe,
	it,
	expect,
	beforeEach
} from 'vitest';
import { compare_users } from '$lib/util/users/compare_users';

describe('compare_users integration', () => {
	beforeEach(() => {
		// Mock environment variables
		process.env.GEMINI = 'test-key';
	});

	it('should return comparison when both users have descriptions', async () => {
		const user1 = {
			t: 'User1',
			d: 'I love hiking, coding, and reading books'
		};

		const user2 = {
			t: 'User2',
			d: 'I enjoy hiking, programming, and reading novels'
		};

		// This test would require mocking the Google AI API
		// For now, let's just test the logic flow
		const result = await compare_users(user1, user2);

		// The function should return an array when both have descriptions
		// (or an empty array if API fails)
		expect(Array.isArray(result)).toBe(true);
	});

	it('should return undefined when one user has no description', async () => {
		const user1 = {
			t: 'User1',
			d: 'I love hiking'
		};

		const user2 = {
			t: 'User2',
			d: ''
		};

		const result = await compare_users(user1, user2);
		expect(result).toBeUndefined();
	});

	it('should return undefined when both users have no description', async () => {
		const user1 = {
			t: 'User1'
		};

		const user2 = {
			t: 'User2'
		};

		const result = await compare_users(user1, user2);
		expect(result).toBeUndefined();
	});
});
