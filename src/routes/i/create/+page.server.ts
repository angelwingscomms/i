import { create } from '$lib/db';
import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({
	locals
}) => {
	if (!locals.user)
		redirect(302, '/google?next=/i/create');
	let i;
	try {
		i = await create({
			s: 'i',
			u: locals.user.i,
			d: Date.now(),
		});
	} catch (e) {
		console.error('create item error:', e);
		throw error(500, 'Failed to create item');
	}
	redirect(302, `/i/${i}/edit`);
};
