import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { embed } from '$lib/util/embed';
import { qdrant, search_by_payload, search_by_vector } from '$lib/db';
import { collection } from '$lib/constants';
import type { Item } from '$lib/types/item';

export const POST: RequestHandler = async ({
	request,
	locals
}) => {
	const {
		q,
		k,
		l = 50,
		s = 'relevance',
		u
	} = (await request.json()) as {
		q?: string;
		k?: 0 | 1;
		l?: number;
		s?: 'relevance' | 'newest' | 'oldest';
		u?: string;
	};

	if (typeof l !== 'number' || l < 1 || l > 200) {
		throw error(400, 'invalid limit (1-200)');
	}

	let results: Array<Item> = [];

	if (q && q.trim()) {
		const vector = await embed(q);
		const results = await search_by_vector<Item>({
			vector,
			filter:{must: {
				s: 'i',
				...(u ? { u } : {}),
				...(k !== undefined ? { k } : {})
			}, must_not: { is_null: { key: 't' } }},
			with_payload: ['t', 'd', 'k', 'a', 'q', 'x'],
			limit: Math.min(54, l * 2)
		});
	} else {
		// No query - return all items with basic filtering
		results = await search_by_payload<Item>(
			{
				s: 'i',
				...(u ? { u } : {}),
				...(k !== undefined ? { k } : {})
			},
			['n', 'd', 'k', 'a', 'q', 'x', 't'],
			Math.min(54, l * 2),
			{
				key: 'a',
				direction: s === 'oldest' ? 'asc' : 'desc'
			}
		);

	}

	console.log('results', results);

	return json(results);
};
