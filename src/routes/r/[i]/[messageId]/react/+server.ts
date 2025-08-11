import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { get, edit_point } from '$lib/db';
import type { Message, Reaction } from '$lib/types';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { emoji } = await request.json();
		if (!emoji) {
			throw error(400, 'Emoji is required');
		}

		const message = await get<Message>(params.messageId);
		if (!message) {
			throw error(404, 'Message not found');
		}

		// Initialize reactions array if it doesn't exist
		if (!message.re) {
			message.re = [];
		}

		// Check if user already reacted with this emoji
		const existingReactionIndex = message.re.findIndex(
			r => r.u === locals.user.i && r.e === emoji
		);

		if (existingReactionIndex >= 0) {
			// Remove existing reaction
			message.re.splice(existingReactionIndex, 1);
		} else {
			// Add new reaction
			message.re.push({
				u: locals.user.i,
				e: emoji,
				d: Date.now()
			});
		}

		// Update message in database
		await edit_point(params.messageId, message);

		return json({ success: true, reactions: message.re });
	} catch (err) {
		console.error('Error handling reaction:', err);
		throw error(500, 'Failed to process reaction');
	}
};
