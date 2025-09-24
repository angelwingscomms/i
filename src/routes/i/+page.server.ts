import type { PageServerLoad } from './$types';
import { qdrant } from '$lib/db';
import { collection } from '$lib/constants';

type SearchItem = {
	i: string;
	t?: string;
	d?: string;
	k?: number;
	a?: number;
	q?: string;
	x?: string[];
	score?: number;
};

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;

	let candidates: SearchItem[] = [];

	const scrollResults = await qdrant.scroll(collection, {
		filter: {
			must: [
				{ key: 's', match: { value: 'i' } },
			],
			must_not: {
				is_null: { key: 't' }
			}
		},
		with_payload: ['t', 'd', 'k', 'a', 'q', 'x'],
		limit: 100
	});

	candidates = scrollResults.points?.map((p: any) => ({
		i: p.id as string,
		...p.payload
	})) || [];

	candidates.sort((a, b) => (b.a || 0) - (a.a || 0));

	const results = candidates.slice(0, 50);

	return {
		user,
		results
	};
};