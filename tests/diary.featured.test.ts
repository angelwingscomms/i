import { describe, expect, it } from 'vitest';
import {
	diary_day_key,
	diary_day_range,
	diary_payload,
	group_diary_by_day,
	recent_diary_sort
} from '$lib/util/diary';

describe('diary helpers', () => {
	it('generates day key', () => {
		const ts = new Date('2024-07-01T10:15:00Z').getTime();
		expect(diary_day_key(ts)).toBe('2024-07-01');
	});

	it('computes day range', () => {
		const range = diary_day_range('2024-07-01');
		expect(range.start).toBe(
			new Date('2024-07-01T00:00:00.000Z').getTime()
		);
		expect(range.end).toBe(
			new Date('2024-07-01T23:59:59.999Z').getTime()
		);
	});

	it('creates sorted grouped payloads', () => {
		const entries = recent_diary_sort([
			diary_payload({
				text: 'entry a',
				user: 'u1',
				date: new Date('2024-07-02T12:00:00Z').getTime()
			}),
			diary_payload({
				text: 'entry b',
				user: 'u1',
				date: new Date('2024-07-01T12:00:00Z').getTime()
			})
		]);
		const grouped = group_diary_by_day(entries);
		expect(Object.keys(grouped)).toEqual([
			'2024-07-02',
			'2024-07-01'
		]);
		expect(grouped['2024-07-02'][0].a).toBe('entry a');
	});
});
