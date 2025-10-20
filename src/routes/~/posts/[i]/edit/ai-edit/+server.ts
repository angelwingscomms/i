import { json, error } from '@sveltejs/kit';
import { get } from '$lib/db';
import { update_post } from '$lib/db/post';
import { generate } from '$lib/util/ai/generate';
import type { Post } from '$lib/types';

export const POST = async ({
	request,
	locals,
	params
}) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}
	const instructions = await request.text();
	const i = params.i;
	if (!i || !instructions?.trim()) {
		throw error(
			400,
			'Post ID and edit instructions required'
		);
	}
	const post = await get<Post>(i, [
		'u',
		't',
		'b',
		'y',
		's'
	]);
	if (!post) {
		throw error(404, 'Post not found');
	}
	if (post.s !== 'p') {
		throw error(400, 'This entity is not a post');
	}
	if (post.u !== locals.user.i) {
		throw error(403, "You don't own this post");
	}
	const prompt = `Edit the following post based on these instructions: "${instructions}". Current post body: "${post.b || ''}". Output the edited post body in markdown format. Do not include any other text or formatting.`;
	const new_content = (await generate(prompt)).trim();

	await update_post(i, {
		b: new_content || post.b,
		l: Date.now()
	});
	return json({
		b: new_content
	});
};
