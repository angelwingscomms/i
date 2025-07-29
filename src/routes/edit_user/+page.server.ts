import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get } from '$lib/db';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.i) {
		redirect(302, '/login');
	}
	return { u: await get(locals.user.i) };
};
