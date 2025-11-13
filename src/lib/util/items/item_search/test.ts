import { describe, expect, it, vi } from 'vitest';
import {
	create_item_search_controller,
	create_item_search_executor,
	parse_item_kind,
	parse_item_sort,
	persist_item_search_state,
	restore_item_search_state
} from './index';
import { fetch_items } from '../fetch_items';

vi.mock('../fetch_items', () => ({
	fetch_items: vi.fn()
}));

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

	it('schedules searches with controller', () => {
		vi.useFakeTimers();
		const set_timeout = vi.fn();
		let stored_timeout: NodeJS.Timeout | null = null;
		const onsearch = vi.fn();
		const controller = create_item_search_controller({
			get_query: () => '',
			set_query: vi.fn(),
			get_kind: () => undefined,
			set_kind: vi.fn(),
			get_sort: () => 'relevance',
			set_sort: vi.fn(),
			get_timeout: () => stored_timeout,
			set_timeout: (timeout) => {
				stored_timeout = timeout;
				set_timeout(timeout);
			},
			onsearch
		});

		controller.handle_search();
		expect(stored_timeout).not.toBeNull();
		vi.runAllTimers();
		expect(onsearch).toHaveBeenCalledTimes(1);

		controller.clear_search();
		expect(stored_timeout).toBeNull();
		vi.useRealTimers();
	});

	it('triggers immediate search when requested', async () => {
		const onsearch = vi.fn();
		const controller = create_item_search_controller({
			get_query: () => '',
			set_query: vi.fn(),
			get_kind: () => undefined,
			set_kind: vi.fn(),
			get_sort: () => 'relevance',
			set_sort: vi.fn(),
			get_timeout: () => null,
			set_timeout: vi.fn(),
			onsearch
		});
		controller.trigger_search();
		expect(onsearch).toHaveBeenCalledTimes(1);
	});

	it('executes search and sets results', async () => {
		const set_results = vi.fn();
		const set_searching = vi.fn();
		vi.mocked(fetch_items).mockResolvedValue([
			{ s: 'i', i: '1', n: 'one', u: 'u', c: 'usd' }
		]);
		const execute = create_item_search_executor({
			get_query: () => 'test',
			get_kind: () => 0,
			get_sort: () => 'relevance',
			set_results,
			set_searching
		});
		await execute();
		expect(set_searching).toHaveBeenNthCalledWith(
			1,
			true
		);
		expect(fetch_items).toHaveBeenCalledWith({
			q: 'test',
			k: 0,
			s: 'relevance',
			limit: 50
		});
		expect(set_results).toHaveBeenCalledWith([
			{ s: 'i', i: '1', n: 'one', u: 'u', c: 'usd' }
		]);
		expect(set_searching).toHaveBeenLastCalledWith(
			false
		);
	});
});
