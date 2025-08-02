// src/routes/api/chat/[id]/+server.js

import { error } from '@sveltejs/kit';

export async function GET({ request, params, platform, locals }) {
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
		// Get the Durable Object stub.
		// The name 'CHAT_ROOMS' must match your wrangler.toml configuration.
		const durable_object_id = platform.env.CHAT_ROOMS.idFromName(room_id);
		const durable_object_stub = platform.env.CHAT_ROOMS.get(durable_object_id);

		// Forward the request to the Durable Object, including userId and tenantId as query parameters.
		// These parameters will be used by the Durable Object to identify the user and categorize messages.
		const url = new URL(request.url);
		url.searchParams.set('userId', user_id);

		// Recreate the request with modified URL to pass search params to DO
		const new_request = new Request(url.toString(), {
			headers: request.headers,
			method: request.method,
			body: request.body,
			redirect: request.redirect
		});

		// Ensure the DB helper functions are available in the DO's environment.
		// This requires passing the `db` module from the platform environment.
		// This specific way of passing `db` through `platform.env` might need
		// adjustment based on how Cloudflare Workers/SvelteKit handles bindings.
		// For now, we assume `platform.env.db` is correctly bound.
		// If not, it would typically be bound in wrangler.toml or via environment variables.
		// This example assumes `db` is available on the `platform.env` object.

		// The actual `fetch` call will implicitly carry over the environment from the worker.
		// We need to ensure the `db` module is bound correctly in `wrangler.toml` for the DO.
		// For now, the DO expects `this.env.db` to have `save_message` and `get_chat_history`.
		// This will be handled in `wrangler.toml` by adding an `import` binding.

		return durable_object_stub.fetch(new_request);
	} catch (e) {
		console.error('Failed to connect to Durable Object or internal error:', e);
		throw error(500, 'Internal Server Error: Could not establish chat connection.');
	}
}
