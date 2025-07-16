import type { PageServerLoad } from './$types';
import { getById, searchByPayload } from '$lib/db';
import type { User } from '$lib/types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const users = await searchByPayload<User>({ u: locals.user.i });
	return {
		u: { name: locals.user.n },
		p: users.map((u) => ({ n: u.n, id: u.id }))
	};
};
