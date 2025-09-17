import { redirect, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getfirst } from '$lib/db';

export const GET: RequestHandler = async ({
	params
}) => {
	const { t } = params;
	if (!t) throw error(400, 'missing room tag');

	const r = await getfirst<{ i: string }>({
		s: 'r',
		t
	});
	if (!r?.i) throw error(404, 'room not found');

	throw redirect(302, `/r/${r.i}`);
};
