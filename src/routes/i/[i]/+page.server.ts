import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get } from '$lib/db';
import type { Item } from '$lib/types/item';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	const { i } = params;
	if (!i) error(400, 'missing item id');
	const item = await get<Record<string, unknown>>(i);
	if (!item || (item as any).s !== 'i')
		error(404, 'item not found');

	return {
		user: locals.user ? { i: locals.user.i, t: locals.user.t } : null,
		i: {...item as unknown as Item, i}
	};
};
