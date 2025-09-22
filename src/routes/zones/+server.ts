import { json } from '@sveltejs/kit';
import { create_zone } from '$lib/db/zone';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		return json({ error: 'Not logged in' }, { status: 401 });
	}
	const id = await create_zone(user.i);
	return json({ i: id });
};