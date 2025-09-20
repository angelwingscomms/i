import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get } from '$lib/db';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	const { i } = params;
	if (!locals.user) {
		redirect(302, '/login');
	}
	if (!i) error(400, 'missing item id');
	const item = await get<Record<string, unknown>>(i);
	if (!item)
		error(404, 'item not found');

	if (locals.user && locals.user.i !== item.u) {
		error(403, "you don't own this item");
	}

	if (item.s !== 'i') {
		error(400, 'this resource is not an item');
	}

	console.debug('item', item);

	return {
		user: locals.user,
		i: {...item, i}
	};
};