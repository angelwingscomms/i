import {
	fireEvent,
	render,
	screen
} from '@testing-library/svelte';
import {
	beforeEach,
	describe,
	expect,
	it,
	vi
} from 'vitest';
import ItemSearch from './ItemSearch.svelte';

describe('ItemSearch', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('triggers search when send button clicked', async () => {
		vi.useFakeTimers();
		const onsearch = vi.fn();
		render(ItemSearch, { props: { onsearch } });
		const input = screen.getByPlaceholderText(
			'search for items...'
		);
		await fireEvent.input(input, {
			target: { value: 'test' }
		});
		const buttons = screen.getAllByRole('button');
		const send_button = buttons.find((button) =>
			button.querySelector('.fa-paper-plane')
		);
		if (!send_button)
			throw new Error('send button not found');
		await fireEvent.click(send_button);
		vi.runAllTimers();
		expect(onsearch).toHaveBeenCalled();
		vi.useRealTimers();
	});

	it('restores saved state from storage', () => {
		localStorage.setItem(
			'item_search_query',
			JSON.stringify({
				q: 'saved',
				k: 0,
				s: 'newest'
			})
		);
		const onsearch = vi.fn();
		render(ItemSearch, { props: { onsearch } });
		expect(
			screen.getByDisplayValue('saved')
		).toBeInTheDocument();
		expect(onsearch).toHaveBeenCalled();
	});

	it('clears query when clear button clicked', async () => {
		const { component } = render(ItemSearch);
		component.$set({ query: 'preset' });
		await Promise.resolve();
		const clear_button = screen.getByLabelText(
			'clear search'
		);
		await fireEvent.click(clear_button);
		const input = screen.getByPlaceholderText(
			'search for items...'
		) as HTMLInputElement;
		expect(input.value).toBe('');
	});
});
