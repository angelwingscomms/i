import type { PageServerLoad } from './$types';
import { scroll } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	// Get recent items (products and services)
	const items = await scroll({
		filter: {
			must: [{ key: 's', match: { value: 'i' } }]
		},
		limit: 20,
		with_payload: true,
		with_vector: false
	});

	return {
		user: locals.user,
		items: items.points?.map(p => ({
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
