import { error, text } from '@sveltejs/kit';
import { create } from '$lib/db';
import type { Room } from '$lib/types';
import { realtime } from '$lib/util/realtime.js';

export async function POST({ request, locals }) {
	if (!locals.user || !locals.user.i) {
		throw error(401, 'Unauthorized');
	}

	let { t, a } = await request.json();
	if (!t)
		error(400, 'missing room tag in request body');
	t = t.trim();

	let create_meeting_res;

	try {
		create_meeting_res = await realtime.post(
			'meetings',
			{ title: t }
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
			'Failed to create room due to an internal server error. Please try again.'
		);
	}

	const room_payload: Omit<Room, 'i'> & { s: 'r' } = {
		s: 'r', // tenant ID for rooms
		t: t.trim(), // room tag
		a: a.trim(), // about room
		c: '',
		q: create_meeting_res.data.data.id,
		_: '.', // public room
		u: locals.user.i, // creator user id
		d: Date.now() // creation timestamp
	};

	let room_id = undefined;

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
			'Failed to create room due to an internal server error. Please try again.'
		);
	}

	return text(room_id);
}
