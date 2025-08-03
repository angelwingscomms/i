import { json, error } from '@sveltejs/kit';
import { upsertPoint } from '$lib/db';
import type { Room, User } from '$lib/types';

export async function POST({ request, locals }) {
	const { room_tag, description } = await request.json();

	const user: User | undefined = locals.user;
	if (!user || !user.i) {
		throw error(401, 'Unauthorized');
	}

	// Server-side input validation
	const validation_errors: { room_tag?: string; description?: string } = {};

	if (!room_tag || typeof room_tag !== 'string' || room_tag.trim().length === 0) {
		validation_errors.room_tag = 'Room Tag is required.';
	} else if (room_tag.trim().length > 50) {
		validation_errors.room_tag = 'Room Tag must be 50 characters or less.';
	}

	if (!description || typeof description !== 'string' || description.trim().length === 0) {
		validation_errors.description = 'Description is required.';
	} else if (description.trim().length > 200) {
		validation_errors.description = 'Description must be 200 characters or less.';
	}

	if (Object.keys(validation_errors).length > 0) {
		throw error(400, {
			message: 'Validation failed',
			errors: validation_errors
		});
	}

	const room_id = crypto.randomUUID(); // Generate a unique ID for the new room

	const room_payload: Omit<Room, 'i'> & { s: 'r' } = {
		s: 'r', // tenant ID for rooms, as required by upsertPoint's generic type
		t: room_tag.trim(), // room tag
		d: description.trim(), // description
		c: user.i, // creator user id
		a: new Date().toISOString() // creation timestamp
	};

	try {
		const new_room_point = await upsertPoint(room_payload);
		const room_id = new_room_point.i;

		// Respond with the ID of the newly created room
		return json({ room_id }, { status: 201 });
	} catch (e) {
		console.error('Error creating room in database:', e);
		throw error(500, 'Failed to create room due to an internal server error. Please try again.');
	}
}
