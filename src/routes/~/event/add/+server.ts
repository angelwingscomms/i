import { error, redirect } from '@sveltejs/kit';
import type { RequestEvent } from './$types';
import {
	create_post,
	update_post
} from '$lib/db/post';

export const POST = async ({
	locals,
	request
}: RequestEvent) => {
	if (!locals.user) throw error(401);

	const formData = await request.formData();
	const t = formData.get('t') as string;
	const b = formData.get('b') as string;
	const v = formData.get('v') as string;
	const c = formData.get('c') as string;

	try {
		const id = await create_post(locals.user.i);
		// Update with form data
		await update_post(id, {
			t: t || undefined,
			b: b || undefined,
			v: v === '.' ? '.' : '',
			c: c === '.' ? '.' : ''
		});
		redirect(302, `/~/posts/${id}`);
	} catch (e) {
		console.error('Error creating post:', e);
		throw error(500, 'Failed to create post');
	}
};
