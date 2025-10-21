import { create, get } from '$lib/db';
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import type { User } from '$lib/types';
import type { Zone } from '$lib/types/zone';
import { get_zone } from '$lib/db/zone';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user)
		redirect(302, '/~/google?next=/items/create');

	let i;
	try {
		let user_zones: Zone[] = [];
		const user_payload = await get<User>(locals.user.i, true);
		const user_zone_ids = Array.isArray(user_payload?.z)
			? user_payload?.z
			: [];
		if (user_zone_ids.length > 0) {
			const zones: Zone[] = [];
			for (const zone_id of user_zone_ids) {
				const zone = await get_zone(zone_id);
				if (zone) {
					zones.push(zone);
				}
			}
			user_zones = zones;
		}
		i = await create({
			s: 'i',
			u: locals.user.i,
			d: Date.now(),
			a: '',
			z: user_zones
		});
	} catch (e) {
		console.error('create item error:', e);
		throw error(500, 'Failed to create item');
	}
	redirect(302, `/~/items/${i}/edit`);
};
