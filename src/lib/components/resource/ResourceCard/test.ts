import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
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
		const { page } = render(ResourceCard, {
			props: { resource: mockResource }
		});
		expect(
			page.getByText('Test Resource')
		).toBeInTheDocument();
	});

	it('renders resource description', () => {
		const { page } = render(ResourceCard, {
			props: { resource: mockResource }
		});
		expect(
			page.getByText(
				'This is a test resource description'
			)
		).toBeInTheDocument();
	});

	it('renders resource summary', () => {
		const { page } = render(ResourceCard, {
			props: { resource: mockResource }
		});
		expect(
			page.getByText('Test summary')
		).toBeInTheDocument();
	});

	it('displays first image when images are present', () => {
		const { page } = render(ResourceCard, {
			props: { resource: mockResource }
		});
		const img = page.getByAltText('Test Resource');
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
		const { page } = render(ResourceCard, {
			props: { resource: resourceWithoutImages }
		});
		expect(page.getByText('T')).toBeInTheDocument(); // First letter of name
	});

	it('links to resource detail page', () => {
		const { page } = render(ResourceCard, {
			props: { resource: mockResource }
		});
		const link = page.getByRole('link');
		expect(link).toHaveAttribute(
			'href',
			'/resource_name/test-id'
		);
	});

	it('displays formatted date', () => {
		const { page } = render(ResourceCard, {
			props: { resource: mockResource }
		});
		const dateElement = page.getByText(
			new Date(mockResource.d).toLocaleDateString()
		);
		expect(dateElement).toBeInTheDocument();
	});
});
