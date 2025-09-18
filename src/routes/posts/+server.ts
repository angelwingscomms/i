import { error, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { create } from '$lib/db';
import { realtime } from '$lib/util/realtime';
import { join_room } from '$lib/db/room';

export const POST: RequestHandler = async ({
	locals
}) => {
	if (!locals.user) throw error(401);
	let id;
	try {
		// Create realtime meeting
		let create_meeting_res;
		try {
			create_meeting_res = await realtime.post(
				'meetings',
				{ title: 'post discussion' }
			);
			if (
				!create_meeting_res ||
				create_meeting_res?.statusText === 'OK'
			)
				throw new Error('Failed to create meeting');
			console.log(
				'create_meeting_res',
				create_meeting_res
			);
		} catch (err) {
			console.error(
				'create cloudflare realtime meeting error: ',
				err
			);
			throw error(
				500,
				'Failed to create post due to an internal server error. Please try again.'
			);
		}

		const room_payload = {
			s: 'r',
			t: 'post discussion',
			a: '',
			c: '',
			q: create_meeting_res.data.data.id,
			_: '.',
			u: locals.user.i,
			d: Date.now()
		};

		let room_id;
		console.log('room_payload', room_payload);

		try {
			room_id = await create(
				room_payload,
				JSON.stringify({
					room_name_or_tag: room_payload.t,
					room_created_by: locals.user?.t,
					room_description: room_payload.a,
					room_type: 'public'
				})
			);
		} catch (e) {
			console.error(
				'Error creating room in database:',
				e
			);
			throw error(
				500,
				'Failed to create post due to an internal server error. Please try again.'
			);
		}

		// Join creator to room
		await join_room(locals.user.i, room_id);

		// Create post with room_id
		id = await create(
			{
				s: 'p',
				u: locals.user.i,
				d: Date.now(),
				r: room_id
			},
			`{created_by: ${locals.user.t}}`
		);
	} catch (e) {
		console.error('Error creating post:', e);
		throw error(500, 'Failed to create post');
	}

	return text(id);
};
