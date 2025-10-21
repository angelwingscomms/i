import { error, redirect } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { World } from '$lib/types';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/~/login');
	}
	const world = await get<World>(params.i);
	if (!world || world.s !== 'w') {
		throw error(404, 'world not found');
	}
	if (world.u !== locals.user.i) {
		throw error(403, 'not authorized');
	}
	return { w: { ...world, i: params.i } };
};
