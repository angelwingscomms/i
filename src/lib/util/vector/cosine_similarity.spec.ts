import { describe, it, expect } from 'vitest';
import { cosine_similarity } from './cosine_similarity';

describe('cosine_similarity', () => {
	it('should return 1 for identical vectors', () => {
		const a = [1, 2, 3];
		const b = [1, 2, 3];
		expect(cosine_similarity(a, b)).toBe(1);
	});

	it('should return 0 for orthogonal vectors', () => {
		const a = [1, 0];
		const b = [0, 1];
		expect(cosine_similarity(a, b)).toBe(0);
	});

	it('should return -1 for opposite vectors', () => {
		const a = [1, 2, 3];
		const b = [-1, -2, -3];
		expect(cosine_similarity(a, b)).toBe(-1);
	});

	it('should handle zero vectors', () => {
		const a = [0, 0, 0];
		const b = [1, 2, 3];
		expect(cosine_similarity(a, b)).toBe(0);
	});

	it('should throw error for vectors of different lengths', () => {
		const a = [1, 2];
		const b = [1, 2, 3];
		expect(() => cosine_similarity(a, b)).toThrow(
			'vectors must be the same length'
		);
	});

	it('should calculate correct similarity for real vectors', () => {
		const a = [1, 2, 3];
		const b = [2, 4, 6];
		// These are parallel vectors, so similarity should be 1
		expect(cosine_similarity(a, b)).toBeCloseTo(1, 5);
	});
});
