import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exists, set } from '$lib/db';

export const POST: RequestHandler = async ({ params }) => {
	const { i } = params;
	if (!i) return json({ error: 'missing user id' }, { status: 400 });
	if (!(await exists(i))) return new Response('user not found', { status: 404 });

	await set(i, { ps: null });
	return json({ success: true });
};
