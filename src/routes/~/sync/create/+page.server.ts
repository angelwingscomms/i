import type { PageServerLoad } from './$types';
import { create } from '$lib/db';
import { error, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user;
	if (!user) throw redirect(302, '/~/login');

	let id: string;
	try {
		id = await create({
			s: 'sync',
			u: user.i,
			d: Date.now(),
			t: []
		});
	} catch (err) {
		console.error('sync create error', err);
		throw error(500, 'unable to create sync project');
	}
		redirect(302, `/~/sync/${id}`);
};
