import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import ZoneCard from './ZoneCard.svelte';

describe('ZoneCard', () => {
	const zone = {
		i: 'z-1',
		n: 'central park',
		l: 40.785091,
		g: -73.968285,
		u: 'u-1',
		d: Date.now(),
		c: ['p-1', 'p-2']
	};

	it('renders zone name', () => {
		render(ZoneCard, { props: { zone } });
		expect(screen.getByText('central park')).toBeInTheDocument();
	});

	it('formats coordinates', () => {
		render(ZoneCard, { props: { zone } });
		expect(screen.getByText(/lat:/)).toHaveTextContent(
			'lat: 40.78509'
		);
		expect(screen.getByText(/lon:/)).toHaveTextContent(
			'lon: -73.96829'
		);
	});

	it('links to zone detail page', () => {
		render(ZoneCard, { props: { zone } });
		const link = screen.getByRole('link');
		expect(link).toHaveAttribute('href', '/zones/z-1');
	});

	it('shows child count', () => {
		render(ZoneCard, { props: { zone } });
		expect(screen.getByText(zone.c!.length.toString())).toBeInTheDocument();
	});

	it('falls back to untitled when name missing', () => {
		render(ZoneCard, {
			props: {
				zone: { ...zone, n: undefined }
			}
		});
		expect(screen.getByText('untitled zone')).toBeInTheDocument();
	});
});
