import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get, qdrant } from '$lib/db';
import { collection } from '$lib/constants';
import { createRoom } from '$lib/room/create';

export const load: PageServerLoad = async ({
	locals,
	params
}) => {
	const { t, s } = (await get<{ t: string | null; s: string | null; }>(params.i, ['t', 's'])) ?? { t: null, s: null };
	if (!t) error(404, 'user not found');
	if (s !== 'u') error(400, 'resource not user');
	if (!locals.user) {
		redirect(302, `/login?next=/u/${params.i}/a`);
	}

	const existing_room = await qdrant.scroll(
		collection,
		{
			filter: {
				must: [
					{ key: 's', match: { value: 'r' } },
					{ key: '_', match: { value: '-' } },
					{
						key: 'x',
						match: { value: locals.user.i }
					},
					{ key: 'x', match: { value: params.i } }
				]
			},
			with_payload: true,
			limit: 1
		}
	);

	// If room exists, redirect to room page
	if (existing_room.points.length > 0) {
		const room_id = existing_room.points[0].id;
		redirect(302, `/r/${room_id}`);
	}


	const roomId = await createRoom({
		users: [locals.user.i, params.i],
		_: '-'
	});
	// Redirect to the newly created room
	redirect(302, `/r/${roomId}`);
};
