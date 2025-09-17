import { embed } from '$lib/util/embed';
import { search_by_vector } from '$lib/db';

export async function search_messages({
	q,
	u,
	r,
	s,
	e
}: {
	q: string;
	u?: string;
	r?: string;
	s?: string;
	e?: string;
}) {
	const vector = await embed(q || '');
	return await search_by_vector<{
		m?: string;
		u?: string;
		r?: string;
		d?: number;
	}>({
		vector,
		with_payload: ['m', 'u', 'r', 'd'],
		filter: {
			must: {
				...(u ? { u } : {}),
				...(r ? { r } : {}),
				...(s ? { s } : {})
			}
		}
	});
}
