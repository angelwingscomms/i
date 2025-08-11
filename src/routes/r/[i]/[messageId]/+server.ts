import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { get, edit_point } from '$lib/db';
import type { Message } from '$lib/types';

// Edit message
export const PUT: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { m } = await request.json();
		if (!m || !m.trim()) {
			throw error(400, 'Message content is required');
		}

		const message = await get<Message>(params.messageId);
		if (!message) {
			throw error(404, 'Message not found');
		}

		// Check if user owns the message
		if (message.u !== locals.user.i) {
			throw error(403, 'You can only edit your own messages');
		}

		// Update message
		message.m = m.trim();
		message.e = true; // Mark as edited

		await edit_point(params.messageId, message);

		return json({ success: true, message });
	} catch (err) {
		console.error('Error editing message:', err);
		throw error(500, 'Failed to edit message');
	}
};

// Delete message
export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const message = await get<Message>(params.messageId);
		if (!message) {
			throw error(404, 'Message not found');
		}

		// Check if user owns the message
		if (message.u !== locals.user.i) {
			throw error(403, 'You can only delete your own messages');
		}

		// Mark message as deleted instead of actually deleting
		message.dl = true;
		message.m = 'This message was deleted';

		await edit_point(params.messageId, message);

		return json({ success: true });
	} catch (err) {
		console.error('Error deleting message:', err);
		throw error(500, 'Failed to delete message');
	}
};
