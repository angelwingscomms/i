import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get } from '$lib/db';
import type { User } from '$lib/types';

export const load: PageServerLoad = async ({
	locals
}) => {
	if (!locals.user?.i) {
		redirect(302, '/google');
	}
	return {
		u: {
			...(await get<User>(locals.user.i)),
			i: locals.user.i
		}
	};
};
