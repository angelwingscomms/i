import { error, json } from '@sveltejs/kit';
import { embed } from '$lib/util/embed';
import { search_by_vector } from '$lib/db';
import type { RequestHandler } from './$types';

type SearchBody = {
	q?: string; // search string
	f?: Record<string, unknown>; // arbitrary filters
	s?: { key: string; direction: 'asc' | 'desc' } | null; // sort, ignored for vector search
	l?: number; // optional limit
};

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as SearchBody;

	const q = body?.q as string;
	if (!q || typeof q !== 'string') {
		throw error(400, 'Missing search string');
	}

	// Ensure we always search rooms
	const filter = { s: 'r', ...(body?.f || {}) };

	// Vectorize query
	const vector = await embed(q);

    // Fetch room tag and optional metadata
    const results = await search_by_vector<{ t?: string; l?: number; m?: number }>({
		vector,
        with_payload: ['t','l','m'],
		limit: Math.min(Math.max(body?.l || 24, 1), 144),
		filter
	});
	
	console.log('r', results)
	// Return list of { i, t } for rooms
    return json(results);
};
