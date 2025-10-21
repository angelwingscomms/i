import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getfirst } from '$lib/db';
import type { User } from '$lib/types';

export const GET: RequestHandler = async ({
	params
}) => {
	const { t } = params;
	if (!t) throw error(400, 'missing user handle');

	const u = await getfirst<User & { i: string }>({
		s: 'u',
		t
	});
	if (!u?.i) throw error(404, 'user not found');

	throw redirect(302, `/~/u/${u.i}/c`);
};
