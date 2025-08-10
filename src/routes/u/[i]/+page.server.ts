import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get } from '$lib/db';
import type { User } from '$lib/types';
import { compare_users } from '$lib/util/users/compare_users';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { i } = params;

	try {
		// Get the user by ID
		const user = await get<User>(i);

		if (!user) {
			throw error(404, 'User not found');
		}

		// Basic user info to return
		const userInfo = {
			i: i,
			tag: user.t,
			avatar: (user as any).av,
			age: user.a,
			gender: user.g,
			description: user.d,
			socialLinks: user.x || []
		};

		// If current user is logged in, compare descriptions
		let comparisonResult = null;
		let local_description: string | undefined = undefined; // New variable for local user's description

		if (locals.user?.i) {
			// Check if local user is logged in
			const self = (await get(locals.user.i, ['d', 't'])) as { d?: string; t: string };
			if (self) {
				local_description = self.d; // Store local user's description
				if (locals.user.i !== user.i) {
					// Only compare if not viewing own profile
					comparisonResult = await compare_users(self, user);
				}
			}
		}

		return {
			u: userInfo,
			c: comparisonResult,
			s: locals.user?.i === user.i,
			ld: local_description // Pass local user's description
		};
	} catch (err) {
		console.error('Error loading user:', err);
		throw error(500, 'Failed to load user');
	}
};
