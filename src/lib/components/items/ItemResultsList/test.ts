import { describe, expect, it } from 'vitest';
import {
	render,
	screen
} from '@testing-library/svelte';
import ItemResultsList from './ItemResultsList.svelte';

const base_item = {
	s: 'i' as const,
	i: '1',
	n: 'item 1',
	u: 'user',
	c: 'usd'
};

describe('ItemResultsList', () => {
	it('renders items', () => {
		render(ItemResultsList, {
			props: {
				results: [
					base_item,
					{ ...base_item, i: '2', n: 'item 2' }
				]
			}
		});
		expect(
			screen.getByText('item 1')
		).toBeInTheDocument();
		expect(
			screen.getByText('item 2')
		).toBeInTheDocument();
	});

	it('renders empty state', () => {
		render(ItemResultsList, {
			props: { results: [] }
		});
		expect(
			screen.getByText('no items found')
		).toBeInTheDocument();
	});
});
