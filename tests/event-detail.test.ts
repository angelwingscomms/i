import {
	describe,
	it,
	expect,
	beforeEach
} from 'vitest';
import {
	render,
	screen
} from '@testing-library/svelte';
import { goto } from '$app/navigation';
import EventDetail from './+page.svelte';

// Mock the goto function
vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

describe('Event Detail Page', () => {
	const mockEvent = {
		i: 'test-event-id',
		n: 'Test Event Name',
		tag: 'test-tag',
		b: 'Test event body content',
		p: 'https://example.com/image.jpg',
		u: 'user-id',
		d: Date.now()
	};

	const mockUser = {
		i: 'user-id',
		t: 'Test User'
	};

	const mockAuthor = {
		i: 'user-id',
		t: 'Test User'
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should display event name instead of title', () => {
		render(EventDetail, {
			props: {
				data: {
					p: mockEvent,
					user: mockUser,
					author: mockAuthor,
					j: 1
				}
			}
		});

		expect(
			screen.getByText('Test Event Name')
		).toBeInTheDocument();
	});

	it('should display event tag when present', () => {
		render(EventDetail, {
			props: {
				data: {
					p: mockEvent,
					user: mockUser,
					author: mockAuthor,
					j: 1
				}
			}
		});

		expect(
			screen.getByText('#test-tag')
		).toBeInTheDocument();
	});

	it('should show "Untitled Event" when name is missing', () => {
		const eventWithoutName = {
			...mockEvent,
			n: undefined
		};

		render(EventDetail, {
			props: {
				data: {
					p: eventWithoutName,
					user: mockUser,
					author: mockAuthor,
					j: 1
				}
			}
		});

		expect(
			screen.getByText('Untitled Event')
		).toBeInTheDocument();
	});

	it('should not display tag when missing', () => {
		const eventWithoutTag = {
			...mockEvent,
			tag: undefined
		};

		render(EventDetail, {
			props: {
				data: {
					p: eventWithoutTag,
					user: mockUser,
					author: mockAuthor,
					j: 1
				}
			}
		});

		expect(
			screen.queryByText(/#/)
		).not.toBeInTheDocument();
	});
});
