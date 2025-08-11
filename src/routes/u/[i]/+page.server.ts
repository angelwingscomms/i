import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get, search_by_vector } from '$lib/db';
import type { User } from '$lib/types';
import { compare_users } from '$lib/util/users/compare_users';
import { embed } from '$lib/util/embed';

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
				if (locals.user.i !== (user as any).i) {
					// Only compare if not viewing own profile
					comparisonResult = await compare_users(self, user);
				}
			}
		}

		// Vector search similar users by this user's description
		let results: Array<Pick<User, 't' | 'a' | 'g' | 'av'> & { i: string; score?: number }> = [];
		if (user.d) {
			const vector = await embed(user.d);
			results = await search_by_vector<User>({
				vector,
				with_payload: ['t', 'a', 'g', 'av'],
				filter: { must: { s: 'u' }, must_not: { i } },
				limit: 20
			});
		}

		return {
			u: userInfo,
			c: comparisonResult,
			s: locals.user?.i === (user as any).i,
			ld: local_description, // Pass local user's description
			r: results.map((u) => ({ i: (u as any).i, t: u.t, a: u.a, g: u.g, av: (u as any).av }))
		};
	} catch (err) {
		console.error('Error loading user:', err);
		throw error(500, 'Failed to load user');
	}
};
