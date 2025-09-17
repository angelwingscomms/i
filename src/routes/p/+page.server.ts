import { search_by_payload, search_by_vector } from '$lib/db';
import { embed } from '$lib/util/embed';
import type { Post } from '$lib/types';

export const load = async ({ url }: { url: URL }) => {
	const q = url.searchParams.get('q') || '';
	let p: Post[] = [];
	if (q) {
		const vector = await embed(q);
		p = await search_by_vector({ vector, limit: 20, filter: { must: { s: 'r' } } });
	} else {
		p = await search_by_payload({ s: 'p' }, true, 20, { key: 'a', order: 'desc' });
	}
	console.log('p.', p)
	return { p, q };
};