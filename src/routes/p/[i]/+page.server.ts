import { error } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { Post } from '$lib/types';

export const load = async ({ params, locals }) => {
	if (!params.i) throw error(400, 'Invalid post id');
	const post: Pick<Post, 'i' | 't' | 'b' | 'p' | 'u' | 'd' | 's'> | null = await get<Post>(params.i, ['i', 't', 'b', 'p', 'u', 'd', 's']);
	if (!post || post.s !== 'p') throw error(404, 'Post not found');
	return { p: post };
};