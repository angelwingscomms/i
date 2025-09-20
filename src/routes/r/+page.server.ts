import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import {
	get,
	qdrant,
	search_by_vector
} from '$lib/db';
import type { Room } from '$lib/types';
import { collection } from '$lib/constants';

type RoomResult = {
	r: Array<{
		i: string;
		t: string;
		l: number;
		// m: number;
	}>;
};

export const load: PageServerLoad = async ({
	locals
}): Promise<RoomResult> => {
	try {
		if (locals.user) {
			const {vector} =
				await get(locals.user.i, undefined, true) as {vector: number[]};
			if (vector) {
				const rooms = await search_by_vector<Room>({
					vector,
					filter: { must: { s: 'r', _: '.' } },
					with_payload: ['t', 'l', 'm'],
					limit: 54
				});
				return {
					r: rooms.map((r) => ({
						i: r.i as string,
						t: r.t as string,
						l: r.l as number
						// m: r.m as number
					}))
				};
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
			).map((r) => ({
				i: r.id as string,
				t: r.payload?.t as string,
				l: r.payload?.l as number
				// m: r.payload?.m as number
			}))
		};
	} catch {
		error(500, 'Failed to load rooms');
	}
};
