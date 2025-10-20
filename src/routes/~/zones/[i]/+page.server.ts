import { error } from '@sveltejs/kit';
import { get_zone } from '$lib/db/zone';
import type { Zone } from '$lib/types';

export const load = async ({ params, locals }) => {
	try {
		if (!params.i)
			throw error(400, 'Invalid zone id');

		const z: Zone | null = await get_zone(params.i);
		if (!z) throw error(404, 'Zone not found');
		if (z.s !== 'z')
			throw error(404, 'This entity is not a zone');

		return {
			z,
			user: locals.user
		};
	} catch (e) {
		console.error('Error fetching zone:', e);
		throw error(500, 'Failed to fetch zone');
	}
};
