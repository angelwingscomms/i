import { describe, expect, it, vi } from 'vitest';
import type { Item } from '$lib/types/item';
import { fetch_items } from './index';

vi.mock('axios', () => ({
	default: {
		post: vi.fn()
	}
}));

describe('fetch_items', () => {
	it('returns items from api response', async () => {
		const mock_items: Item[] = [
			{
				s: 'i',
				i: '1',
				n: 'item one',
				u: 'user',
				c: 'usd'
			}
		];
		const axios = (await import('axios')).default;
		vi.mocked(axios.post).mockResolvedValue({
			data: mock_items
		});
		await expect(
			fetch_items({ q: 'test' })
		).resolves.toEqual(mock_items);
		expect(axios.post).toHaveBeenCalledWith('/i', {
			q: 'test'
		});
	});
});
