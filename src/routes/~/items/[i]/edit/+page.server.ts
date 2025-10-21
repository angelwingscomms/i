import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get } from '$lib/db';
import type { Item } from '$lib/types/item';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	if (!locals.user) {
		redirect(302, '/~/login');
	}
	if (!params.i) error(400, 'missing item id');
	const item = await get<Item>(params.i);
	if (!item) error(404, 'item not found');

	if (locals.user && locals.user.i !== item.u) {
		error(403, "you don't own this item");
	}

	if (item.s !== 'i') {
		error(400, 'this resource is not an item');
	}

	console.debug('edit item', item);

	return {
		i: { ...item, i: params.i }
	};
};
