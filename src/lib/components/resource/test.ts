import { describe, it, expect } from 'vitest';
import {
	render,
	screen
} from '@testing-library/svelte';
import ResourceSearch from './ResourceSearch.svelte';
import type { Resource } from '$lib/types/resource';

describe('ResourceSearch', () => {
	const mockResources: Resource[] = [
		{
			n: 'Test Resource 1',
			b: 'This is the body of the first resource',
			p: ['image1.jpg', 'image2.jpg'],
			u: 'user1',
			d: Date.now(),
			a: 'About the first resource'
		},
		{
			n: 'Test Resource 2',
			b: 'This is the body of the second resource',
			p: [],
			u: 'user2',
			d: Date.now() - 86400000,
			a: 'About the second resource'
		}
	];

	it('renders resources correctly', () => {
		render(ResourceSearch, {
			results: mockResources
		});

		expect(
			screen.getByText('Test Resource 1')
		).toBeInTheDocument();
		expect(
			screen.getByText('Test Resource 2')
		).toBeInTheDocument();
		expect(
			screen.getByText('About the first resource')
		).toBeInTheDocument();
		expect(
			screen.getByText('About the second resource')
		).toBeInTheDocument();
	});

	it('displays no resources message when empty', () => {
		render(ResourceSearch, { results: [] });

		expect(
			screen.getByText('No resources found')
		).toBeInTheDocument();
		expect(
			screen.getByText(
				'Try adjusting your search terms or filters'
			)
		).toBeInTheDocument();
	});

	it('renders resource links correctly', () => {
		render(ResourceSearch, {
			results: mockResources
		});

		const link1 = screen.getByRole('link', {
			name: /Test Resource 1/
		});
		const link2 = screen.getByRole('link', {
			name: /Test Resource 2/
		});

		expect(link1).toHaveAttribute(
			'href',
			'/resource/Test Resource 1'
		);
		expect(link2).toHaveAttribute(
			'href',
			'/resource/Test Resource 2'
		);
	});
});
