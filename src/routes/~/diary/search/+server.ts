import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { embed } from '$lib/util/embed';
import {
	diary_day_range,
	diary_filter
} from '$lib/util/diary';
import { qdrant, search_by_vector } from '$lib/db';
import type { DiaryEntry } from '$lib/types';

export const POST: RequestHandler = async ({
	locals,
	request
}) => {
	const user = locals.user;
	if (!user) error(401, 'not authorized');

	const { q, d } = await request.json();
	const query = typeof q === 'string' ? q.trim() : '';
	const day = typeof d === 'string' ? d : null;

	if (!query) {
		const results = await qdrant.scroll('i', {
			filter: diary_filter({ user: user.i, day }),
			with_payload: true,
			limit: 30,
			order_by: { key: 'd', direction: 'desc' }
		});
		return json(
			results.points.map((point: any) => ({
				i: point.id,
				...point.payload
			}))
		);
	}

	const vector = await embed(query);

	const filter = diary_filter({ user: user.i, day });

	const results = await search_by_vector<DiaryEntry>({
		vector,
		filter,
		with_payload: ['a', 'd', 'u', 's']
	});

	return json(results);
};
