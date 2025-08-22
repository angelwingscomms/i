import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get, list } from '$lib/db';

export const load: PageServerLoad = async ({ params }) => {
	const { i } = params;
	if (!i) error(400, 'missing item id');
	const item = await get<Record<string, unknown>>(i);
	if (!item || (item as any).s !== 'i') error(404, 'item not found');

	// Get related items from the same user (excluding current item)
	let relatedItems: Record<string, unknown>[] = [];
	if (item.u) {
		try {
			const allItems = await list<Record<string, unknown>>({
				s: 'i',
				u: item.u
			});

			relatedItems = allItems
				.filter((relatedItem) => relatedItem.i !== i)
				.slice(0, 6); // Limit to 6 related items
		} catch (err) {
			console.error('Error fetching related items:', err);
			relatedItems = [];
		}
	}

	return {
		i: item,
		relatedItems
	};
};

