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
					filter: { must: { s: 'p', _: '.' } },
					with_payload: ['t', 'l', 'm'],
					limit: 54
				});
				return {
					r: posts.map((r) => ({
						i: r.i,
						t: r.t,
						l: r.l,
						m: r.m
					}))
				};
			}
		}
		return {
			p: (
				await qdrant
					.scroll(collection, {
						filter: {
							must: [
								{
									key: 's',
									match: {
										value: 'p'
									}
								},
								{
									key: '_',
									match: {
										value: '.'
									}
								}
							]
						},
						with_payload: ['t', 'l'],
						limit: 54
					})
					.then((result) => result.points || [])
			).map((r) => ({
				i: r.id,
				t: r.payload?.t,
				l: r.payload?.l
			}))
		};
	} catch {
		error(500, 'Failed to load rooms');
	}
};
