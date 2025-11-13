import {
	sanitize_markers,
	markers_to_segments
} from '$lib/util/sync/markers';

describe('sanitize_markers', () => {
	it('drops invalid values and sorts ascending', () => {
		const result = sanitize_markers([
			-500,
			0,
			1000.123,
			Number.NaN,
			2000,
			Infinity
		]);
		expect(result).toEqual([0, 1000.12, 2000]);
	});

	it('respects max duration and count', () => {
		const result = sanitize_markers(
			[0, 100, 200, 300, 400],
			{
				max_duration: 250,
				max_count: 3
			}
		);
		expect(result).toEqual([0, 100, 200]);
	});
});

describe('markers_to_segments', () => {
	it('creates alternating segments ending at provided duration', () => {
		const segments = markers_to_segments(
			[1000, 2500],
			{ end: 4000 }
		);
		expect(segments).toEqual([
			{ start: 0, end: 1000, color: 'black' },
			{ start: 1000, end: 2500, color: 'white' },
			{ start: 2500, end: 4000, color: 'black' }
		]);
	});

	it('handles empty markers gracefully', () => {
		const segments = markers_to_segments([], {
			end: 1000
		});
		expect(segments).toEqual([
			{ start: 0, end: 1000, color: 'black' }
		]);
	});
});
