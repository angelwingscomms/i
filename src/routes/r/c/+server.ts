import { error, text } from '@sveltejs/kit';
import { create } from '$lib/db';
import type { Room } from '$lib/types';

export async function POST({ request, locals }) {

	if (!locals.user || !locals.user.i) {
		throw error(401, 'Unauthorized');
	}

	const {  t,  d } = await request.json();
	if (!t) error(400, 'missing room tag in request body')

	const room_payload: Omit<Room, 'i'> & { s: 'r' } = {
		s: 'r', // tenant ID for rooms
		t: t.trim(), // room tag
		d: d.trim(), // description
		u: locals.user.i, // creator user id
		a: new Date().toISOString() // creation timestamp
	};

	try {
		const id = await create(room_payload, JSON.stringify({room_name_or_tag: room_payload.t, room_created_by: locals.user?.t, room_description: room_payload.d}));

		return text(id)
	} catch (e) {
		console.error('Error creating room in database:', e);
		throw error(500, 'Failed to create room due to an internal server error. Please try again.');
	}
}
