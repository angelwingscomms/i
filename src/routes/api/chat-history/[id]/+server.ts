import { get_chat_history } from '$lib/db';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { ChatMessage } from '$lib/types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const { id: room_id } = params;

	// Ensure the user is logged in
	const user = locals.user;
	if (!user || !user.u) {
		throw error(401, 'Unauthorized: User not logged in or missing user ID.');
	}

	// Validate room_id
	if (!room_id) {
		throw error(400, 'Bad Request: Missing chat room ID.');
	}

	try {
		const history: ChatMessage[] = await get_chat_history(room_id);
		return json(history);
	} catch (e) {
		console.error(`Error fetching chat history for room ${room_id}:`, e);
		throw error(500, 'Internal Server Error: Could not retrieve chat history.');
	}
};
