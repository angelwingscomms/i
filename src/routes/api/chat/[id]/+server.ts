// i/src/routes/api/chat/[id]/+server.ts

import { error, type RequestHandler } from '@sveltejs/kit';
import type { Platform } from '$lib/types'; // Assuming Platform type is defined or can be inferred

export const GET: RequestHandler = async ({ request, params, platform, locals }) => {
	const { id: room_id } = params;

	// Get logged in user from locals.user
	const user = locals.user;
	if (!user || !user.u) {
		throw error(401, 'Unauthorized: User not logged in or missing user ID.');
	}

	const user_id = user.u; // Use 'u' for user ID as per convention

	// Basic validation for room_id
	if (!room_id) {
		throw error(400, 'Missing chat room ID.');
	}

	try {
		// Ensure platform.env is defined for Cloudflare Workers environment
		if (!platform || !platform.env) {
			console.error('Platform or platform.env is undefined.');
			throw error(500, 'Internal Server Error: Cloudflare environment not available.');
		}

		// Type assertion for platform.env to include CHAT_ROOMS, if not already inferred
		const env = platform.env as Platform['env'] & { CHAT_ROOMS: DurableObjectNamespace };

		// Get the Durable Object stub.
		// The name 'CHAT_ROOMS' must match your wrangler.toml configuration.
		const durable_object_id = env.CHAT_ROOMS.idFromName(room_id);
		const durable_object_stub = env.CHAT_ROOMS.get(durable_object_id);

		// Forward the request to the Durable Object, including userId as a query parameter.
		const url = new URL(request.url);
		url.searchParams.set('userId', user_id);

		// Recreate the request with modified URL to pass search params to DO
		const new_request = new Request(url.toString(), {
			headers: request.headers,
			method: request.method,
			body: request.body,
			redirect: request.redirect
		});

		return durable_object_stub.fetch(new_request);
	} catch (e: unknown) {
		console.error('Failed to connect to Durable Object or internal error:', e);
		if (e instanceof Error) {
			throw error(500, `Internal Server Error: Could not establish chat connection. ${e.message}`);
		}
		throw error(500, 'Internal Server Error: An unknown error occurred.');
	}
};
