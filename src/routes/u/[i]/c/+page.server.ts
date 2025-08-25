import { redirect, error, text } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { create, get, qdrant, search_by_payload } from '$lib/db';
import { s } from '$lib/util/s';
import { cf } from '$lib/util/cf';
import { PUBLIC_WORKER } from '$env/static/public';
import type { ChatMessage, DBChatMessage, Room, User } from '$lib/types';
import { collection } from '$lib/constants';

export const load: PageServerLoad = async ({ locals, params, platform }) => {
	const t: string | null = await get(params.i, 't');
	if (!t) error(404, 'user not found');
	if (!locals.user) {
		redirect(302, `/google?next=/u/${params.i}/c`);
	}

	const existing_room = await qdrant.scroll(collection, {
		filter: {
			must: [
				{ key: 's', match: { value: 'r' } },
				{ key: 'r', match: { any: [locals.user.i, params.i] } },
				{ key: 'u', match: { any: [locals.user.i, params.i] } }
			]
		},
		with_payload: true,
		limit: 1
	});

	// If room exists, return its properties
	if (existing_room.points.length > 0) {
		const room_id = existing_room.points[0].id;
		const room_data = existing_room.points[0].payload as Room;

		return {
			m: (await Promise.all(
				(
					await search_by_payload<DBChatMessage & { i: string }>(
						{ s: 'm', r: room_id },
						['m', 'u', 'd'],
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
			c: room_data.c,
			t
		};
	}

	const c: string = await (await cf(platform)('http' + PUBLIC_WORKER + '/i' + (await s()))).text();

	const room_payload: Pick<Room, 'x' | 's' | 'c' | 'd' | 'o' | 'r' | 'u'> = {
		s: 'r',
		c,
		d: Date.now(),
		o: '|',
		r: params.i,
		u: locals.user.i
	};

	const r = await create(
		{ ...room_payload, s: 'r' },
		JSON.stringify({
			room_members: [locals.user?.t, t],
			room_type: `direct message`
		})
	);

	return {
		m: [],
		s: await s(),
		c,
		t
	};
};
