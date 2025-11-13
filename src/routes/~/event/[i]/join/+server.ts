import { error } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import { get, qdrant } from '$lib/db';
import type { User } from '$lib/types';

export const POST = async ({
	params,
	locals
}: RequestEvent) => {
	if (!locals.user) return error(401, 'Unauthorized');

	const eventId = params.i;
	if (!eventId) return error(400, 'Invalid event id');

	try {
		// Get the user
		const user = await get<User>(locals.user.i, [
			'ev'
		]);
		if (!user) return error(404, 'User not found');

		// Check if already joined
		const ev = user.ev || [];
		if (ev.includes(eventId)) {
			return error(400, 'Already joined this event');
		}

		// Add event id to ev array
		ev.push(eventId);

		// Update user payload
		await qdrant.setPayload('i', {
			points: [locals.user.i],
			payload: { ev },
			wait: true
		});

		return new Response(
			JSON.stringify({ success: true }),
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);
	} catch (e) {
		console.error('Error joining event:', e);
		return error(500, 'Failed to join event');
	}
};
