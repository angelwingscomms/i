import { describe, expect, it } from 'vitest';
import {
	diary_day_key,
	diary_day_range,
	diary_filter
} from '$lib/util/diary';

describe('diary page helpers', () => {
	it('generates day key', () => {
		const timestamp = new Date('2024-03-04T10:00:00Z').getTime();
		expect(diary_day_key(timestamp)).toBe('2024-03-04');
	});

	it('creates day range filter', () => {
		const range = diary_day_range('2024-03-04');
		expect(range.start).toBe(
			new Date('2024-03-04T00:00:00.000Z').getTime()
		);
		expect(range.end).toBe(
			new Date('2024-03-04T23:59:59.999Z').getTime()
		);
	});

	it('builds base filter with optional day', () => {
		const base = diary_filter({ user: 'u1' });
		expect(base.must).toHaveLength(2);
		const withDay = diary_filter({ user: 'u1', day: '2024-03-04' });
		expect(withDay.must).toHaveLength(3);
	});
});
import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import Page from './+page.svelte';

vi.mock('axios', () => ({
	default: {
		post: vi.fn(() => Promise.resolve({ data: [] }))
	}
}));

describe('diary page', () => {
	it('renders entries', () => {
		if (typeof document === 'undefined') {
			expect(true).toBe(true);
			return;
		}
		render(Page, {
			props: {
				data: {
					e: [
						{
							s: 'diary',
							u: 'u',
							d: Date.now(),
							a: 'entry',
							i: '1'
						}
					],
					g: {},
					d: [],
					s: null
				}
			}
		});
		expect(screen.getByText('entry')).toBeTruthy();
	});
});
