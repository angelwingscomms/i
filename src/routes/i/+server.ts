import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { create } from '$lib/db';
import type { DBChatMessage } from '$lib/types';

export const POST: RequestHandler = async ({ locals, request }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const body = (await request.json()) as { m: string; d: number; i?: string };
	if (!body?.m || typeof body.m !== 'string') throw error(400, 'missing message');
	const payload: DBChatMessage = {
		s: 'm',
		u: locals.user.i,
		d: body.d || Date.now(),
		m: body.m,
		r: locals.user.i
	};
	const i = await create(payload, body.m, body.i);
	return json({ i }, { status: 201 });
};

