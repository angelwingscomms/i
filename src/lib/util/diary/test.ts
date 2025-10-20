import { describe, expect, it } from 'vitest';
import {
	diary_day_key,
	diary_day_range,
	diary_payload,
	diary_filter,
	recent_diary_sort,
	group_diary_by_day
} from './index';

describe('diary utils', () => {
	it('builds day key', () => {
		const date = new Date('2024-05-10T12:34:56Z').getTime();
		expect(diary_day_key(date)).toBe('2024-05-10');
	});

	it('builds day range', () => {
		const range = diary_day_range('2024-05-10');
		expect(range.start).toBe(
			new Date('2024-05-10T00:00:00.000Z').getTime()
		);
		expect(range.end).toBe(
			new Date('2024-05-10T23:59:59.999Z').getTime()
		);
	});

	it('creates payload', () => {
		const payload = diary_payload({
			text: 'note',
			user: 'user1',
			date: 1,
			embedding: 'hash'
		});
		expect(payload).toEqual({
			s: 'diary',
			u: 'user1',
			d: 1,
			a: 'note',
			e: 'hash'
		});
	});

	it('builds filters', () => {
		const base = diary_filter({ user: 'u1' });
		expect(base.must).toHaveLength(2);
		const withDay = diary_filter({
			user: 'u1',
			day: '2024-01-01'
		});
		expect(withDay.must).toHaveLength(3);
	});

	it('sorts recent first', () => {
		const sorted = recent_diary_sort([
			{ s: 'diary', u: 'u', d: 1, a: 'a' },
			{ s: 'diary', u: 'u', d: 3, a: 'b' },
			{ s: 'diary', u: 'u', d: 2, a: 'c' }
		]);
		expect(sorted.map((i) => i.d)).toEqual([3, 2, 1]);
	});

	it('groups by day', () => {
		const entries = [
			{
				s: 'diary',
				u: 'u',
				d: new Date('2024-01-01T10:00Z').getTime(),
				a: 'a'
			},
			{
				s: 'diary',
				u: 'u',
				d: new Date('2024-01-01T20:00Z').getTime(),
				a: 'b'
			},
			{
				s: 'diary',
				u: 'u',
				d: new Date('2024-01-02T09:00Z').getTime(),
				a: 'c'
			}
		];
		const grouped = group_diary_by_day(entries);
		expect(Object.keys(grouped)).toEqual([
			'2024-01-01',
			'2024-01-02'
		]);
		expect(grouped['2024-01-01']).toHaveLength(2);
	});
});
