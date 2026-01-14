import { create } from '$lib/db';
import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	locals,
	url
}) => {
	if (!locals.user) redirect(302, '/~/login');
	
	const user1 = locals.user.i;
	const user2 = url.searchParams.get('u');
	
	if (!user2) error(400, 'second user id required');
	
	// Create desire with both user ids
	const i = await create({
		s: 'd',
		i: [user1, user2],
		d: ['', ''], // Empty desires initially
		u: user1
	});
	
	redirect(302, `/~/desire/${i}`);
};