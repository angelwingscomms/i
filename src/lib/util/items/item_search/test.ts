import { describe, expect, it, vi } from 'vitest';
import {
	parse_item_kind,
	parse_item_sort,
	persist_item_search_state,
	restore_item_search_state
} from './index';

describe('item_search util', () => {
	it('persists and restores state', () => {
		const storage: Storage = {
			getItem: vi.fn(),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0
		};
		persist_item_search_state(storage, {
			q: 'query',
			k: 1,
			s: 'newest'
		});
		expect(storage.setItem).toHaveBeenCalledWith(
			'item_search_query',
			JSON.stringify({
				q: 'query',
				k: 1,
				s: 'newest'
			})
		);
		vi.mocked(storage.getItem).mockReturnValue(
			JSON.stringify({
				q: 'saved',
				k: 0,
				s: 'oldest'
			})
		);
		expect(
			restore_item_search_state(storage)
		).toEqual({
			q: 'saved',
			k: 0,
			s: 'oldest'
		});
	});

	it('restores fallback state when parsing fails', () => {
		const storage: Storage = {
			getItem: vi.fn().mockReturnValue('not-json'),
			setItem: vi.fn(),
			removeItem: vi.fn(),
			clear: vi.fn(),
			key: vi.fn(),
			length: 0
		};
		expect(
			restore_item_search_state(storage)
		).toBeNull();
	});

	it('parses kind correctly', () => {
		expect(parse_item_kind('0')).toBe(0);
		expect(parse_item_kind('1')).toBe(1);
		expect(parse_item_kind('')).toBeUndefined();
	});

	it('parses sort correctly', () => {
		expect(parse_item_sort('newest')).toBe('newest');
		expect(parse_item_sort('oldest')).toBe('oldest');
		expect(parse_item_sort('unknown')).toBe(
			'relevance'
		);
	});
});
