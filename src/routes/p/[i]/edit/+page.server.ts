import { error } from '@sveltejs/kit';
import type { LocalsUser, Post } from '$lib/types';
import { get } from '$lib/db';

export const load = async ({ params, locals }: { params: { i: string }; locals: { user?: LocalsUser } }) => {
	const { i } = params;
	const post = await get<Post>(i);
	if (!post || post.s !== 'r') error(404, 'Post not found');
	if (post.u !== locals.user?.i) error(403, 'Not authorized');
	return { post, user: locals.user };
};