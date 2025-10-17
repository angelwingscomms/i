import { describe, expect, it } from 'vitest';
import { match_percent } from './index';

describe('match_percent', () => {
	it('returns rounded percent when score is within range', () => {
		expect(match_percent(0.756)).toBe(76);
	});

	it('clamps score below zero to zero', () => {
		expect(match_percent(-1)).toBe(0);
	});

	it('clamps score above one to one hundred', () => {
		expect(match_percent(2)).toBe(100);
	});

	it('returns null when score is not a number', () => {
		expect(match_percent(undefined)).toBeNull();
		expect(match_percent(NaN)).toBeNull();
	});
});
