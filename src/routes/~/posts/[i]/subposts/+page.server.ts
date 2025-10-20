import { error } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { Post } from '$lib/types';

export const load = async ({ params }) => {
	const parent = await get<Post>(params.i, [
		't',
		'u'
	]);
	if (!parent) throw error(404, 'post not found');
	return { parent: { ...parent, i: params.i } };
};
