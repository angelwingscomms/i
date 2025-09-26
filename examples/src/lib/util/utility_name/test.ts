import { utility_name } from '../index';

describe('utility_name', () => {
	it('processes input', () => {
		expect(utility_name('test')).toBe(
			'processed test'
		);
	});
});
