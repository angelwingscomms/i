import type { PageServerLoad } from '../../../items/$types';
import { search_by_payload } from '$lib/db';

export const load: PageServerLoad = async ({
	locals
}) => {
	const user = locals.user;
	// Get recent items (products and services)
	const items = await search_by_payload(
		{ s: 'i' },
		['n', 'd', 'k', 'x', 'u', 'a'],
		20,
		{
			key: 'a',
			direction: 'desc'
		}
	);
	console.log('items', items);

	return {
		user,
		results: items
	};
};
