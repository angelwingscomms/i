import type { PageServerLoad } from './$types';
import { get, qdrant } from '$lib/db';
import { redirect } from '@sveltejs/kit';
import { collection } from '$lib/constants';

export const load: PageServerLoad = async ({
	locals
}) => {
	if (!locals.user || !locals.user.i) {
		redirect(302, '/login');
	}

	const userRooms = (await get(
		locals.user.i,
		'r'
	)) as string[];
	console.log('userRooms', userRooms);

	const rr = await qdrant.scroll(collection, {
		filter: {
			must: [{ key: 's', match: { value: 'r' } }],
			should: [
				{ has_id: userRooms },
				{ key: 'r', match: { value: locals.user.i } },
				{ key: 'u', match: { value: locals.user.i } },
				{ key: 'x', match: { value: locals.user.i } }
			]
		},
		with_payload: ['t', 'l', '_', 'u', 'x'],
		limit: 144
	});
	console.log('rr', rr);
	const r = await Promise.all(
		rr.points.map(async (p) => {
			console.log('p', p);
			if (p.payload?._ === '-') {
				if (p.payload.u === locals.user?.i) {
					p.payload.t = await get<string>(
						p.payload.r as string,
						't'
					);
				} else {
					delete p.payload.t;
				}
				delete p.payload.u; // !important, so the other user doesn't know who is behind this anon chat
			} else if (p.payload?._ === '|') {
				p.payload.t = await get<string>(
					(p.payload.x as string[])?.find(
						(x) => x !== locals.user?.i
					) as string,
					't'
				);
			}
			return { i: p.id, ...p.payload };
		})
	);

	return { r };
};
