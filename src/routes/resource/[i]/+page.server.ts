import { error } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	if (!params.i) error(400, 'missing resource id');
	const r = await get<{ s: string; u?: string }>(
		params.i
	);
	if (!r) error(404, 'resource not found');
	if (r.s !== 'resource')
		error(400, 'this resource is not a resource');
	// if this resource should only be viewed by the owner
	if (r.u !== locals.user?.i)
		error(403, 'not authorized');
	return { r: { ...r, i: params.i } };
};
