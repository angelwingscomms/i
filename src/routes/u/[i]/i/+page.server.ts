import type { PageServerLoad } from '../../../i/$types';
import { search_by_payload } from '$lib/db';

export const load: PageServerLoad = async ({
}) => {
	// Get recent items (products and services)
	const items = await search_by_payload(
		{ s: 'i' },
		['t', 'd', 'k', 'x', 'u', 'a'],
		20,
		{
			key: 'a',
			direction: 'desc'
		}
	);
	console.log('items', items);

	return {
		i: items
	};
};
