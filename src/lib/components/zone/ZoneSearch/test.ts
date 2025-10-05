import { fireEvent, render, screen } from '@testing-library/svelte';
import axios from 'axios';
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import ZoneSearch from './ZoneSearch.svelte';

vi.mock('axios', () => ({
	default: {
		post: vi.fn(() => Promise.resolve({ data: [] }))
	}
}));

const mockedAxios = axios as unknown as {
	post: Mock;
};

describe('ZoneSearch', () => {
	beforeEach(() => {
		localStorage.clear();
		mockedAxios.post.mockReset();
	});

	it('triggers search when send button clicked', async () => {
		vi.useFakeTimers();
		mockedAxios.post.mockResolvedValueOnce({ data: [] });
		render(ZoneSearch);
		const input = screen.getByPlaceholderText('search for zones...');
		await fireEvent.input(input, {
			target: { value: 'central' }
		});
		const buttons = screen.getAllByRole('button');
		const sendButton = buttons.find((button) =>
			button.querySelector('.fa-paper-plane')
		);
		if (!sendButton) throw new Error('send button not found');
		await fireEvent.click(sendButton);
		vi.runAllTimers();
		expect(mockedAxios.post).toHaveBeenCalledWith('/zones/search', {
			q: 'central'
		});
		vi.useRealTimers();
	});

	it('restores saved query from storage', async () => {
		vi.useFakeTimers();
		localStorage.setItem('zone_search_query', 'saved');
		mockedAxios.post.mockResolvedValue({ data: [] });
		render(ZoneSearch);
		vi.runAllTimers();
		expect(screen.getByDisplayValue('saved')).toBeInTheDocument();
		expect(mockedAxios.post).toHaveBeenCalled();
		vi.useRealTimers();
	});

	it('emits selection when result clicked', async () => {
		const onSelect = vi.fn();
		render(ZoneSearch, {
			props: {
				initial_zones: [
					{ i: 'z-1', n: 'alpha', l: 1, g: 2 }
				],
				onSelect
			}
		});
		const option = await screen.findByText('alpha');
		await fireEvent.click(option);
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ i: 'z-1' }));
	});
});
