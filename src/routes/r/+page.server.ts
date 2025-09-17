import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { get, qdrant, search_by_vector } from '$lib/db';
import type { Room } from '$lib/types';
import { collection } from '$lib/constants';

export const load: PageServerLoad = async ({ locals }) => {
	try {
		if (locals.user) {
			const vector = await get(locals.user.i, undefined, true);
			if (vector) {
				let rooms = await search_by_vector<Room>({
					vector: vector.vector,
					filter: { must: { s: 'r', _: '.' } },
					with_payload: ['t', 'l', 'm'],
					limit: 54
				});
				return { r: rooms.map((r) => ({ i: r.i, t: r.t, l: r.l, m: r.m })) };
			}
		}
		return {
			r: (
				await qdrant
					.scroll(collection, {
						filter: {
							must: [
								{
									key: 's',
									match: {
										value: 'r'
									}
								},
								{
									key: '_',
									match: {
										value: '.'
									}
								}
							]
						},
						with_payload: ['t', 'l', 'm'],
						limit: 54
					})
					.then((result) => result.points || [])
			).map((r) => ({ i: r.id, t: r.payload?.t, l: r.payload?.l, m: r.payload?.m }))
		};
	} catch {
		error(500, 'Failed to load rooms');
	}
};
