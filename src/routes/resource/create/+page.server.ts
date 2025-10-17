import { create } from '$lib/db';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	locals
}) => {
	if (!locals.user) redirect(302, '/login');
	const i = await create({
		s: 'resource',
		u: locals.user.i,
		d: Date.now()
	});
	redirect(302, `/resource_name/${i}/edit`);
};
