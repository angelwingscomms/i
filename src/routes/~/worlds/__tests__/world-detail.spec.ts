import {
	beforeEach,
	describe,
	expect,
	it,
	vi
} from 'vitest';

const getMock = vi.fn();
const searchMock = vi.fn();

vi.mock('$lib/db', () => ({
	get: (...args: any[]) => getMock(...args),
	search_by_payload: (...args: any[]) =>
		searchMock(...args)
}));

vi.mock('$lib/db/character', () => ({
	create_character: vi.fn()
}));

vi.mock('$lib/db/environment', () => ({
	create_environment: vi.fn()
}));

vi.mock('$lib/ai/world', () => ({
	generate_character: vi.fn(),
	generate_environment: vi.fn()
}));

import { load } from '../[i]/+page.server';

describe('worlds detail load', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		getMock.mockReset();
		searchMock.mockReset();
	});

	it('falls back when qdrant search rejects with forbidden error', async () => {
		getMock.mockResolvedValue({
			s: 'w',
			u: 'user-1',
			n: 'test world',
			d: Date.now()
		});

		searchMock
			.mockRejectedValueOnce(new Error('Forbidden'))
			.mockResolvedValueOnce([
				{
					s: 'wc',
					u: 'user-1',
					w: 'world-1',
					n: 'hero',
					d: 1,
					i: 'char-1'
				}
			])
			.mockRejectedValueOnce(new Error('Forbidden'))
			.mockResolvedValueOnce([
				{
					s: 'we',
					u: 'user-1',
					w: 'world-1',
					n: 'forest',
					d: 2,
					i: 'env-1'
				}
			]);

		const consoleSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});

		const result = await load({
			params: { i: 'world-1' },
			locals: { user: { i: 'user-1' } }
		} as any);

		expect(result.c).toHaveLength(1);
		expect(result.v).toHaveLength(1);
		expect(searchMock).toHaveBeenCalledTimes(4);
		expect(searchMock.mock.calls[0][3]).toEqual({
			key: 'd',
			direction: 'desc'
		});
		expect(
			searchMock.mock.calls[1][3]
		).toBeUndefined();
		consoleSpy.mockRestore();
	});

	it('returns empty lists when both primary and fallback searches fail', async () => {
		getMock.mockResolvedValue({
			s: 'w',
			u: 'user-1',
			n: 'empty world',
			d: Date.now()
		});

		searchMock.mockRejectedValue(
			new Error('Forbidden')
		);

		const consoleSpy = vi
			.spyOn(console, 'error')
			.mockImplementation(() => {});

		const result = await load({
			params: { i: 'world-1' },
			locals: { user: { i: 'user-1' } }
		} as any);

		expect(result.c).toHaveLength(0);
		expect(result.v).toHaveLength(0);
		expect(searchMock).toHaveBeenCalledTimes(4);
		consoleSpy.mockRestore();
	});
});
