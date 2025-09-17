import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { set } from '$lib/db';

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user?.i) return json({ error: 'unauthorized' }, { status: 401 });
	try {
		const body = await request.json().catch(() => ({}) as any);
		const update: Record<string, unknown> = {};
		if (typeof body.ic === 'boolean') update.ic = body.ic;
		update.on = Date.now();
		await set(locals.user.i, update);
		return new Response(null, { status: 204 });
	} catch (e) {
		return json({ error: 'failed' }, { status: 500 });
	}
};
