import { describe, it, expect, vi } from 'vitest';
import { redirect } from '@sveltejs/kit';
import { load } from './+page.server';
import { get_collection } from '$lib/db';

// Mock dependencies
vi.mock('$lib/db', () => ({
	get_collection: vi.fn()
}));

vi.mock('@sveltejs/kit', () => ({
	redirect: vi.fn()
}));

describe('Event Tag Redirect Route', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should redirect to event when tag is found', async () => {
		const mockEvent = {
			i: 'event-123',
			tag: 'test-tag'
		};
		vi.mocked(get_collection).mockResolvedValue([
			mockEvent
		]);

		await load({ params: { t: 'test-tag' } } as any);

		expect(get_collection).toHaveBeenCalledWith(
			'i',
			{
				s: 'ev',
				tag: 'test-tag'
			},
			1
		);
		expect(redirect).toHaveBeenCalledWith(
			302,
			'/~/event/event-123'
		);
	});

	it('should redirect to event list when tag is not found', async () => {
		vi.mocked(get_collection).mockResolvedValue([]);

		await load({
			params: { t: 'nonexistent-tag' }
		} as any);

		expect(get_collection).toHaveBeenCalledWith(
			'i',
			{
				s: 'ev',
				tag: 'nonexistent-tag'
			},
			1
		);
		expect(redirect).toHaveBeenCalledWith(
			302,
			'/~/event'
		);
	});

	it('should redirect to event list when tag parameter is missing', async () => {
		await load({ params: {} } as any);

		expect(get_collection).not.toHaveBeenCalled();
		expect(redirect).toHaveBeenCalledWith(
			302,
			'/~/event'
		);
	});

	it('should redirect to event list when database error occurs', async () => {
		vi.mocked(get_collection).mockRejectedValue(
			new Error('Database error')
		);

		await load({ params: { t: 'test-tag' } } as any);

		expect(get_collection).toHaveBeenCalledWith(
			'i',
			{
				s: 'ev',
				tag: 'test-tag'
			},
			1
		);
		expect(redirect).toHaveBeenCalledWith(
			302,
			'/~/event'
		);
	});
});
