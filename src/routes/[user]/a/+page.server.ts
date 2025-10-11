import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	get,
	qdrant,
	find_user_by_tag
} from '$lib/db';
import { collection } from '$lib/constants';
import { createRoom } from '$lib/room/create';

export const load: PageServerLoad = async ({
	locals,
	params
}) => {
	const user = await find_user_by_tag(params.user);
	if (!user) error(404, 'user not found');
	if (user.s !== 'u') error(400, 'resource not user');
	if (!locals.user) {
		redirect(302, `/login?next=/${params.user}/a`);
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
					{ key: 'x', match: { value: user.i } }
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
		users: locals.user.i,
		_: '-',
		extra: { r: user.i }
	});
	// Redirect to the newly created room
	redirect(302, `/r/${roomId}`);
};
