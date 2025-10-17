import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ItemCard from './ItemCard.svelte';

describe('ItemCard', () => {
	const item = {
		s: 'i' as const,
		i: 'id-1',
		n: 'test item',
		u: 'user',
		c: 'usd',
		d: Date.now(),
		x: ['https://example.com/item.jpg'],
		score: 0.87
	};

	it('renders item name and image', () => {
		render(ItemCard, { props: { item } });
		expect(screen.getByText('test item')).toBeInTheDocument();
		const img = screen.getByAltText('test item');
		expect(img).toHaveAttribute('src', item.x[0]);
	});

	it('shows fallback initial when no image', () => {
		render(ItemCard, {
			props: {
				item: { ...item, x: undefined }
			}
		});
		expect(screen.getByText('T')).toBeInTheDocument();
	});

	it('displays match percent', () => {
		render(ItemCard, { props: { item } });
		expect(screen.getByText('87%')).toBeInTheDocument();
	});
});
