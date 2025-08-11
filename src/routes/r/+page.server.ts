import type { PageServerLoad } from './$types';
import { json, error } from '@sveltejs/kit';
import { get, search_by_payload, search_by_vector } from '$lib/db';
import type { Room } from '$lib/types';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		if (locals.user) {
			const vector = await get(locals.user.i, undefined, true);
			if (vector) {
				let rooms = await search_by_vector<Room>({
					vector: vector.vector,
					filter: { must: { s: 'r' } },
					with_payload: ['t', 'l', 'm'],
					limit: 54
				});
				return { r: rooms.map((r) => ({ i: r.i, t: r.t, l: r.l, m: r.m })) };
			}
		}
		return {
			r: (
				await search_by_payload<Room>(
					{
						s: 'r'
					},
					['t', 'l', 'm'],
					54,
					// {
					// 	key: 'a',
					// 	direction: 'desc'
					// }
				)
			).map((r) => ({ i: r.i, t: r.t, l: r.l, m: r.m }))
		};
	} catch {
		error(500, 'Failed to load rooms');
	}
};
