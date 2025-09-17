import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { create, get, qdrant } from '$lib/db';
import { s } from '$lib/util/s';
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
				{ key: 'x', match: { value: locals.user.i } },
				{ key: 'x', match: { value: params.i } }
			]
		},
		with_payload: true,
		limit: 1
	});

	// If room exists, redirect to room page
	if (existing_room.points.length > 0) {
		console.log('existing room', existing_room.points[0]);
		const room_id = existing_room.points[0].id;
		redirect(302, `/r/${room_id}`);
	}

	const c: string = await (await platform.env.r.fetch('http://./i' + (await s()))).text();

	const room_payload: Pick<Room, 'x' | 's' | 'c' | 'd' | '_' | 'r' | 'u'> = {
		s: 'r',
		c,
		d: Date.now(),
		_: '|',
		x: [locals.user.i, params.i]
	};

	const r = await create(
		room_payload,
		JSON.stringify({
			room_members: room_payload.x,
			room_type: `direct message`
		})
	);

	// Redirect to the newly created room
	redirect(302, `/r/${r}`);
};
