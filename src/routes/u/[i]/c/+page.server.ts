import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { create, get, qdrant, update_point } from '$lib/db';
import { s } from '$lib/util/s';
import { cf } from '$lib/util/cf';
import { PUBLIC_WORKER } from '$env/static/public';
import type { Room } from '$lib/types';
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
				{ key: '_', match: { value: '|' } },
				{ key: 'r', match: { any: [locals.user.i, params.i] } },
				{ key: 'u', match: { any: [locals.user.i, params.i] } }
			]
		},
		with_payload: true,
		limit: 1
	});

	// If room exists, redirect to room page
	if (existing_room.points.length > 0) {
		const room_id = existing_room.points[0].id;
		redirect(302, `/r/${room_id}`);
	}

	const c: string = await (await cf(platform)('http' + PUBLIC_WORKER + '/i' + (await s()))).text();

	const room_payload: Pick<Room, 'x' | 's' | 'c' | 'd' | '_' | 'r' | 'u'> = {
		s: 'r',
		c,
		d: Date.now(),
		_: '|',
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

	// Add room ID to both users' .r arrays
	const auth_rooms: string[] = (await get(locals.user.i, 'r')) || [];
	const user_rooms: string[] = (await get(params.i, 'r')) || [];

	// Update current user's room list
	if (!auth_rooms.includes(r)) {
		await qdrant.setPayload(collection, {
			wait: true,
			payload: { r: [...auth_rooms, r] },
			points: [locals.user.i]
		});
	}

	// Update target user's room list
	const targetUserRooms = user_rooms?.r || [];
	if (!targetUserRooms.includes(r)) {
		await qdrant.setPayload(collection, {
			wait: true,
			payload: { r: [...targetUserRooms, r] },
			points: [params.i]
		});
	}

	// Redirect to the newly created room
	redirect(302, `/r/${r}`);
};
