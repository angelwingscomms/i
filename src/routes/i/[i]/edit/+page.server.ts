import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get } from '$lib/db';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const { i } = params;
	if (!i) error(400, 'missing item id');
	const item = await get<Record<string, unknown>>(i);
	if (!item || (item as any).s !== 'i')
		error(404, 'item not found');
	if ((item as any).u !== locals.user.i) throw error(403, 'Not owner');

	return {
		i: {...item, i}
	};
};