import { json, error } from '@sveltejs/kit';
import { create_zone } from '$lib/db/zone';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({
	request,
	locals
}) => {
	const user = locals.user;
	if (!user) {
		error(401, 'not logged in');
	}

	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		error(400, 'invalid json body');
	}

	const n = typeof body.n === 'string' ? body.n.trim() : '';
	const l = Number(body.l);
	const g = Number(body.g);

	if (!n) error(400, 'name required');
	if (!Number.isFinite(l) || !Number.isFinite(g))
		error(400, 'invalid coordinates');

	const id = await create_zone(user.i, {
		n,
		l,
		g
	});

	return json({ i: id });
};
