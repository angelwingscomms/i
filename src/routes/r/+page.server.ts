import type { PageServerLoad } from './$types';
import { json, error } from '@sveltejs/kit';
import { search_by_payload } from '$lib/db';
import type { Room } from '$lib/types';

export const load: PageServerLoad = async () => {
	try {
		const rooms = await search_by_payload<Room>({ s: 'r' }, ['t', 'l', 'm'], 54, {
			key: 'l',
			direction: 'desc'
		});
		return { r: rooms.map((r) => ({ i: r.i, t: r.t, l: r.l, m: r.m })) };
	} catch {
		error(500, 'Failed to load rooms');
	}
};
