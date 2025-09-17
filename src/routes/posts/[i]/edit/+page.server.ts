import { error, redirect } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { PageServerLoad } from './$types';
import type { Post } from '$lib/types';

export const load: PageServerLoad = async ({
	locals,
	params
}) => {
	if (!locals.user) {
		throw redirect(303, '/google');
	}
	const p = await get<
		Pick<Post, 'u' | 'b' | 'd' | 'l' | 's'>
	>(params.i, ['u', 'b', 't', 's']);
	if (!p) {
		throw error(404, 'Post not found');
	}
	if (p.s !== 'p') {
		throw error(404, 'This entity is not a post');
	}
	if (p.u !== locals.user.i) {
		throw error(403, "You don't own this post");
	}
	return {
		p: { ...p, i: params.i }
	};
};
