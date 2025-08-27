import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { get, search_by_payload } from '$lib/db';
import type { ChatMessage, DBChatMessage, Room } from '$lib/types';
import { s } from '$lib/util/s';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!params.i) error(400, 'missing room id');

	const r = await get<Pick<Room, 't' | 'c' | '_' | 'u' | 'r' | 'x'>>(params.i, [
		't',
		'c',
		'o',
		'_',
		'u',
		'r',
		'x'
	]);
	console.log('r', r);
	if (!r) error(404, 'room not found');

	// Check if user has access to this room
	if (locals.user) {
		switch (r._) {
			case ',': {
				const userRooms: string[] = (await get(locals.user.i, 'r')) || [];
				if (!userRooms.includes(params.i)) {
					error(403, 'you do not belong to this room');
				}
				break;
			}
			case '|': {
				if (!r.x?.includes(locals.user.i)) error(403, 'you do not belong to this room');
				r.t = r.x?.find((x) => x !== locals.user?.i) || '';
				break;
			}
			case '-': {
				r.t = locals.user.i === r.r ? '' : (await get<string>(r.r!, 't')) || '';
				delete r.r;
				break;
			}
		}
	}

	return {
		m: (await Promise.all(
			(
				await search_by_payload<DBChatMessage & { i: string; f?: string[] }>(
					{ s: 'm', r: params.i },
					['m', 'u', 'd', 'f'],
					72,
					{
						key: 'd',
						direction: 'asc'
					}
				)
			).map(async (m) => ({
				...m,
				x: m.u ? ((await get<string>(m.u, 't')) as string) : ''
			}))
		)) satisfies ChatMessage[],
		s: await s(),
		...r
	};
};
