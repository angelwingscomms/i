import type { PageServerLoad } from './$types';
import { search_by_payload } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	// Get recent items (products and services)
	const items = await search_by_payload({ s: 'i' }, ['t', 'd', 'k', 'x', 'u', 'a'], 20, {
		key: 'a',
		direction: 'desc'
	});

	return {
		user: locals.user,
		items:
			items.points?.map((p) => ({
				i: p.id,
				t: p.payload?.t || '',
				d: p.payload?.d || '',
				k: p.payload?.k || 0,
				x: p.payload?.x || [],
				u: p.payload?.u || '',
				a: p.payload?.a || Date.now()
			})) || []
	};
};
