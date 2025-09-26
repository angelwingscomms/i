import { error, redirect } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	if (!locals.user) redirect(302, '/login');
	const r = await get(params.i);
	if (!r) error(404, 'resource not found');
	if (r.s !== 'resource')
		error(400, 'this resource is not a resource');
	if (r.u !== locals.user.i)
		error(403, 'not authorized');
	return { r: { ...r, i: params.i } };
};
