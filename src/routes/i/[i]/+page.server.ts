import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get } from '$lib/db';

export const load: PageServerLoad = async ({ params }) => {
	const { i } = params;
	if (!i) error(400, 'missing item id');
	const item = await get<Record<string, unknown>>(i);
	if (!item || (item as any).s !== 'i') error(404, 'item not found');

	return {
		i: item
	};
};
