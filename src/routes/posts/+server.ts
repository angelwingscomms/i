import { error, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { create } from '$lib/db';
import { realtime } from '$lib/util/realtime';

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
				{ title: 'post comments' }
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

		// Create post with room_id
		id = await create(
			{
				s: 'p',
				u: locals.user.i,
				d: Date.now(),
				r: create_meeting_res.data.data.id
			},
			`{created_by: ${locals.user.t}}`
		);
	} catch (e) {
		console.error('Error creating post:', e);
		throw error(500, 'Failed to create post');
	}

	return text(id);
};
