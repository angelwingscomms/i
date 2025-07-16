import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { qdrant } from '$lib/db';
import { searchByPayload } from '$lib/db';
import type { User } from '$lib/types';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('q');
	if (!query) {
		throw error(400, 'Search query is required');
	}

	try {
		const results = await searchByPayload<User>({
			s: 'usr',
			u: query
		});
		return json({ results });
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to search for users');
	}
};
