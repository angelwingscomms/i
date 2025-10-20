import { search_by_payload, search_by_vector } from '$lib/db';
import { embed } from '$lib/util/embed';
import type { World } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const q = url.searchParams.get('q')?.trim() || '';
	if (!locals.user) {
		return { q, w: [] };
	}
	const filter = { s: 'w', u: locals.user.i };
	let w: (World & { i: string; score?: number })[] = [];
	if (q) {
		const vector = await embed(q);
		w = await search_by_vector<World>({
			vector,
			filter: { must: filter },
			limit: 54
		});
	} else {
		w = await search_by_payload<World>(
			filter,
			true,
			54,
			{ key: 'd', direction: 'desc' }
		);
	}
	return {
		q,
		w
	};
};
