import type { PageServerLoad } from './$types';
import { search_by_payload } from '$lib/db';
import type { Item } from '$lib/types';

export const load: PageServerLoad = async ({
	locals
}) => {
	if (!locals.user) {
		return { results: [] };
	}

	const results = await search_by_payload<Item>(
		{ s: 'i' },
		['n', 'd', 'k', 'a', 'q', 'x'],
		50,
		{ key: 'a', direction: 'desc' }
	);

	return {
		results
	};
};
