import { error } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { Post } from '$lib/types';

export const load = async ({ params, locals }) => {
	if (!params.i) throw error(400, 'Invalid post id');
	const post: Pick<
		Post,
		't' | 'b' | 'p' | 'u' | 'd' | 's'
	> | null = await get<Post>(params.i, [
		't',
		'b',
		'p',
		'u',
		'd',
		's'
	]);
	if (!post)
		throw error(404, 'Post not found');
	if (p.s !== 'p') {
		throw error(404, 'This entity is not a post');
	}
	return { p: {...post, i: params.i} };
};
