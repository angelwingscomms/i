import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	locals
}) => {
	if (!locals.user?.i) {
		redirect(302, '/~/google');
	}
	return { userId: locals.user.i };
};
