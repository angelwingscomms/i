import { describe, it, expect } from 'vitest';
import {
	render,
	screen
} from '@testing-library/svelte';
import ResourceCard from './ResourceCard.svelte';

describe('ResourceCard', () => {
	const mockResource = {
		s: 'resource' as const,
		i: 'test-id',
		n: 'Test Resource',
		b: 'This is a test resource description',
		p: [
			'https://example.com/image1.jpg',
			'https://example.com/image2.jpg'
		],
		u: 'user-id',
		d: Date.now(),
		a: 'Test summary'
	};

	it('renders resource name', () => {
		render(ResourceCard, {
			props: { resource: mockResource }
		});
		expect(
			screen.getByText('Test Resource')
		).toBeInTheDocument();
	});

	it('renders resource description', () => {
		render(ResourceCard, {
			props: { resource: mockResource }
		});
		expect(
			screen.getByText(
				'This is a test resource description'
			)
		).toBeInTheDocument();
	});

	it('renders resource summary', () => {
		render(ResourceCard, {
			props: { resource: mockResource }
		});
		expect(
			screen.getByText('Test summary')
		).toBeInTheDocument();
	});

	it('displays first image when images are present', () => {
		render(ResourceCard, {
			props: { resource: mockResource }
		});
		const img = screen.getByAltText('Test Resource');
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute(
			'src',
			'https://example.com/image1.jpg'
		);
	});

	it('displays fallback when no images', () => {
		const resourceWithoutImages = {
			...mockResource,
			p: undefined
		};
		render(ResourceCard, {
			props: { resource: resourceWithoutImages }
		});
		expect(screen.getByText('T')).toBeInTheDocument(); // First letter of name
	});

	it('links to resource detail page', () => {
		render(ResourceCard, {
			props: { resource: mockResource }
		});
		const link = screen.getByRole('link');
		expect(link).toHaveAttribute(
			'href',
			'/resource_name/test-id'
		);
	});

	it('displays formatted date', () => {
		render(ResourceCard, {
			props: { resource: mockResource }
		});
		const dateElement = screen.getByText(
			new Date(mockResource.d).toLocaleDateString()
		);
		expect(dateElement).toBeInTheDocument();
	});
});
