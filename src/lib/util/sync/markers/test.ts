import {
	markers_to_segments,
	sanitize_markers
} from './index';

describe('sanitize_markers', () => {
	it('removes invalid and duplicate values', () => {
		expect(
			sanitize_markers([
				-10,
				0,
				1000,
				1000.004,
				Number.POSITIVE_INFINITY as unknown as number,
				NaN
			])
		).toEqual([0, 1000]);
	});

	it('clamps to max duration and count', () => {
		expect(
			sanitize_markers([0, 50, 100, 200], {
				max_duration: 120,
				max_count: 3
			})
		).toEqual([0, 50, 100]);
	});
});

describe('markers_to_segments', () => {
	it('creates alternating segments', () => {
		expect(markers_to_segments([1000, 2000], { end: 3000 })).toEqual([
			{ start: 0, end: 1000, color: 'black' },
			{ start: 1000, end: 2000, color: 'white' },
			{ start: 2000, end: 3000, color: 'black' }
		]);
	});
});
