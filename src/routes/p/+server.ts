import { error, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { create } from '$lib/db';

export const POST: RequestHandler = async ({
	locals
}) => {
	if (!locals.user) throw error(401);
	let id;
	try {
		id = await create(
			{ s: 'p', u: locals.user.i, d: Date.now() },
			`{created_by: ${locals.user.t}}`
		);
	} catch (e) {
		console.error('Error creating post:', e);
		throw error(500, 'Failed to create post');
	}

	return text(id);
};
