import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get } from '$lib/db';
import type { User } from '$lib/types';
import { compare_users } from '$lib/util/users/compare_users';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { id } = params;

	try {
		// Get the user by ID
		const user = await get<User>(id);

		if (!user) {
			throw error(404, 'User not found');
		}

		// Basic user info to return
		const userInfo = {
			tag: user.t,
			age: user.a,
			gender: user.g,
			description: user.d,
			socialLinks: user.x || []
		};

		// If current user is logged in, compare descriptions
		let comparisonResult = null;
		if (locals.user?.i && locals.user.i !== user.i) {
			const self = (await get(locals.user.i, ['d', 't'])) as { d: string; t: string };
			comparisonResult = await compare_users(self, user)
		}

		// console.log('comparisonResult', comparisonResult)

		return {
			u: userInfo,
			c: comparisonResult,
			s: locals.user?.i === user.i
		};
	} catch (err) {
		console.error('Error loading user:', err);
		throw error(500, 'Failed to load user');
	}
};
