import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { create } from '$lib/db';
import { realtime } from '$lib/util/realtime';


export const load: PageServerLoad = async ({
	locals
}) => {
	if (!locals.user) throw error(401);
	
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

	console.log('create_meeting_res', create_meeting_res);

	let id;
	try {
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

	try {
		return redirect(302, `/posts/${id}/edit`);
	} catch (e) {
		console.error('Error redirecting:', e);
		throw error(500, 'Failed to redirect after post creation');
	}
};
