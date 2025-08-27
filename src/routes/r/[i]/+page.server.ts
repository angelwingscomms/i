import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { get, search_by_payload } from '$lib/db';
import type { ChatMessage, DBChatMessage, Room } from '$lib/types';
import { s } from '$lib/util/s';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!params.i) error(400, 'missing room id');

	const r = await get<Pick<Room, 't' | 'c' | '_' | 'u' | 'r'>>(params.i, ['t', 'c', 'o', '_', 'u', 'r']);
	console.log('r', r);
	if (!r) error(404, 'room not found');

	// Check if user has access to this room
	if (locals.user) {
		if (r._ === ',') {
			const userRooms: string[] = (await get(locals.user.i, 'r')) || [];
			if (!userRooms.includes(params.i)) {
				error(403, 'you do not belong to this room');
			}
		}
		if (r._ === '|') {
			r.t = r.u === locals.user.i ? (await get<string>(r.r!, 't'))! : (await get<string>(r.r!, 't'))!;
		} else if (r._ === '-') {
			const tag = await get<string>(r.r!, 't');
			r.t = tag ?? '';
			delete r.r;
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
