import { json } from '@sveltejs/kit';
import { embed } from '$lib/util/embed';
import {
	count,
	search_by_payload,
	search_by_vector
} from '$lib/db';
import type { RequestHandler } from './$types';

type SearchBody = {
	q?: string; // search string
	f?: Record<string, unknown>; // arbitrary filters
	s?: {
		key: string;
		direction: 'asc' | 'desc';
	} | null; // sort, ignored for vector search
	l?: number; // optional limit
};

export const POST: RequestHandler = async ({
	request
}) => {
	const body = (await request.json()) as SearchBody;

	const q = (body?.q as string) || '';
	const limit = Math.min(
		Math.max(body?.l || 24, 1),
		144
	);
	const payload_filter: Record<string, unknown> = {
		s: 'p'
	};

	// General filters from body.f
	const filters =
		body.f || ({} as Record<string, unknown>);
	for (const [key, value] of Object.entries(
		filters
	)) {
		if (value !== undefined && value !== null) {
			payload_filter[key] = value;
		}
	}

	// Private filter
	if (body.private) {
		payload_filter.v = '.';
	}

	if (q.trim()) {
		const vector = await embed(q.trim());
		const results = await search_by_vector<{
			t?: string;
			l?: number;
			m?: number;
		}>({
			vector,
			with_payload: ['t', 'l', 'm'],
			limit,
			filter: { must: payload_filter }
		});
		console.log(
			'Server-side search results (vector):',
			results
		);
		return json(results);
	} else {
		// No query: payload-only search
		const results = await search_by_payload<{
			t?: string;
			l?: number;
			m?: number;
		}>(payload_filter, ['t', 'l', 'm'], limit);

		return json(results);
	}
};
