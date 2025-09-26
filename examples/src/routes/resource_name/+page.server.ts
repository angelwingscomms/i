import type { PageServerLoad } from './$types';
import { qdrant } from '$lib/db';

type SearchResource = {
	i: string;
	n?: string;
	b?: string;
	p?: string[];
	a?: string;
	score?: number;
};

export const load: PageServerLoad = async ({
	locals
}) => {
	const user = locals.user;

	let candidates: SearchResource[] = [];

	const scrollResults = await qdrant.scroll('i', {
		filter: {
			must: [
				{ key: 's', match: { value: 'resource' } }
			],
			must_not: {
				is_null: { key: 'n' }
			}
		},
		with_payload: ['n', 'b', 'p', 'a'],
		limit: 100
	});

	candidates =
		scrollResults.points?.map((p: any) => ({
			i: p.id as string,
			...p.payload
		})) || [];

	candidates.sort(
		(a, b) => (b.score || 0) - (a.score || 0)
	);

	const results = candidates.slice(0, 50);

	return {
		user,
		results
	};
};
