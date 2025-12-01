import {
	describe,
	it,
	expect,
	beforeEach
} from 'vitest';
import {
	render,
	screen,
	fireEvent
} from '@testing-library/svelte';
import EventEdit from './edit/+page.svelte';

describe('Event Edit Page', () => {
	const mockEvent = {
		i: 'test-event-id',
		n: 'Test Event Name',
		tag: 'test-tag',
		b: 'Test event body content',
		v: '',
		c: '',
		u: 'user-id',
		d: Date.now()
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should have name input field', () => {
		render(EventEdit, {
			props: {
				data: {
					p: mockEvent
				}
			}
		});

		const nameInput = screen.getByLabelText('name');
		expect(nameInput).toBeInTheDocument();
		expect(nameInput).toHaveValue('Test Event Name');
	});

	it('should have tag input field', () => {
		render(EventEdit, {
			props: {
				data: {
					p: mockEvent
				}
			}
		});

		const tagInput = screen.getByLabelText('tag');
		expect(tagInput).toBeInTheDocument();
		expect(tagInput).toHaveValue('test-tag');
	});

	it('should show correct placeholders', () => {
		const emptyEvent = {
			...mockEvent,
			n: '',
			tag: ''
		};

		render(EventEdit, {
			props: {
				data: {
					p: emptyEvent
				}
			}
		});

		expect(
			screen.getByPlaceholderText('event name')
		).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText('event tag')
		).toBeInTheDocument();
	});
});
