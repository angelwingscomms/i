import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { embed } from '$lib/util/embed';
import { qdrant } from '$lib/db';
import { collection } from '$lib/constants';

export const POST: RequestHandler = async ({
	request
}) => {
	const {
		q,
		kind,
		limit = 50,
		sort = 'relevance'
	} = (await request.json()) as {
		q?: string;
		kind?: 0 | 1;
		limit?: number;
		sort?: 'relevance' | 'newest' | 'oldest';
	};

	if (
		typeof limit !== 'number' ||
		limit < 1 ||
		limit > 200
	) {
		throw error(400, 'invalid limit (1-200)');
	}

	let candidates: Array<{
		i: string;
		t?: string;
		d?: string;
		k?: number;
		a?: number;
		q?: string;
		x?: string[];
	}> = [];

	if (q && q.trim()) {
		const vector = await embed(q);
		const results = await qdrant.query(collection, {
			query: vector,
			filter: {
				must: [
					{ key: 's', match: { value: 'i' } },
					...(kind !== undefined
						? [{ key: 'k', match: { value: kind } }]
						: [])
				],
				must_not: {
					is_null: { key: 't' }
				}
			},
			with_payload: ['t', 'd', 'k', 'a', 'q', 'x'],
			limit: Math.min(500, limit * 2)
		});
		candidates =
			results.points?.map((p) => ({
				i: p.id as string,
				...p.payload
			})) || [];
	} else {
		// No query - return all items with basic filtering
		const results = await qdrant.scroll(collection, {
			filter: {
				must: [
					{ key: 's', match: { value: 'i' } },
					...(kind !== undefined
						? [{ key: 'k', match: { value: kind } }]
						: [])
				],
				must_not: {
					is_null: { key: 't' }
				}
			},
			with_payload: ['t', 'd', 'k', 'a', 'q', 'x'],
			limit: Math.min(500, limit * 2)
		});
		candidates =
			results.points?.map((p) => ({
				i: p.id as string,
				...p.payload
			})) || [];
	}

	// Sort results based on criteria
	switch (sort) {
		case 'newest':
			candidates.sort(
				(a, b) => (b.a || 0) - (a.a || 0)
			);
			break;
		case 'oldest':
			candidates.sort(
				(a, b) => (a.a || 0) - (b.a || 0)
			);
			break;
		case 'relevance':
		default:
			// For vector search, results are already sorted by relevance (score)
			// For payload search, maintain insertion order or sort by newest
			if (!q || !q.trim()) {
				candidates.sort(
					(a, b) => (b.a || 0) - (a.a || 0)
				);
			}
			break;
	}

	// Limit results
	const results = candidates.slice(0, limit);

	return json(results);
};
