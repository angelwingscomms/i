import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import {
	get,
	qdrant,
	search_by_vector
} from '$lib/db';
import type { Post } from '$lib/types';
import { collection } from '$lib/constants';

export const load: PageServerLoad = async ({
	locals
}) => {
	try {
		if (locals.user) {
			const { vector } = await get(
				locals.user.i,
				undefined,
				true
			);
			if (vector) {
				const posts = await search_by_vector<Post>({
					vector,
					filter: { must: { s: 'p' } },
					with_payload: ['t', 'l', 'm', 'u', 'v'],
					limit: 54
				});
				const filtered = posts.filter(r => r.v !== '.' || r.u === locals.user.i);
				return {
					p: filtered.map((r) => ({
						i: r.i,
						t: r.t,
						l: r.l
					}))
				};
			}
		}
		const allPosts = await qdrant
			.scroll(collection, {
				filter: {
					must: [
						{
							key: 's',
							match: {
								value: 'p'
							}
						}
					]
				},
				with_payload: ['t', 'l', 'u', 'v'],
				limit: 54
			})
			.then((result) => result.points || []);

		const filtered = locals.user
			? allPosts.filter(r => r.payload.v !== '.' || r.payload.u === locals.user.i)
			: allPosts.filter(r => r.payload.v !== '.');

		return {
			p: filtered.map((r) => ({
				i: r.id,
				t: r.payload?.t,
				l: r.payload?.l
			}))
		};
	} catch {
		error(500, 'Failed to load rooms');
	}
};
