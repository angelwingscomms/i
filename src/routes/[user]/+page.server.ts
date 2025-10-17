import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
	get,
	search_by_payload,
	search_by_vector,
	find_user_by_tag
} from '$lib/db';
import type { Item, User } from '$lib/types';
import { compare_users } from '$lib/util/users/compare_users';
import { embed } from '$lib/util/embed';

export const load: PageServerLoad = async ({
	locals,
	params
}) => {
	const { user: tag } = params;
	console.log('tag', tag);

	// Get the user by tag
	const user = await find_user_by_tag(tag);

	if (!user) {
		throw error(404, 'User not found');
	}

	// Basic user info to return
	const userInfo = {
		i: user.i,
		tag: user.t,
		m: user.m,
		avatar: (user as any).av,
		age: user.a,
		gender: user.g,
		description: user.d,
		socialLinks: user.x || [],
		on: (user as any).on,
		ic: (user as any).ic
	};

	// If current user is logged in, compare descriptions
	let comparisonResult = null;
	let local_description: string | undefined =
		undefined; // New variable for local user's description
	let user_items: Array<Item & { i: string }> = [];

	if (locals.user?.i) {
		// Check if local user is logged in
		const self = (await get(locals.user.i, [
			'd',
			't'
		])) as { d?: string; t: string };
		if (self) {
			local_description = self.d; // Store local user's description
			if (locals.user.i !== (user as any).i) {
				// Only compare if not viewing own profile
				comparisonResult = await compare_users(
					self,
					user
				);
			}
		}
	}

	const items = await search_by_payload<Item>(
		{
			s: 'i',
			u: user.i
		},
		[
			'n',
			'd',
			'k',
			'x',
			'u',
			'a',
			'h',
			'c'
		],
		32,
		{
			key: 'd',
			direction: 'desc'
		}
	);

	user_items = items.filter((item) => item.h !== '.');

	// Vector search similar users by this user's description
	let results: Array<
		Pick<User, 't' | 'a' | 'g' | 'av'> & {
			i: string;
			score?: number;
		}
	> = [];
	if (user.d) {
		const vector = await embed(user.d);
		results = await search_by_vector<
			Pick<User, 't' | 'av' | 'a' | 'g'>
		>({
			vector,
			with_payload: ['t', 'a', 'g', 'av'],
			filter: {
				must: { s: 'u' },
				must_not: { i: user.i }
			},
			limit: 20
		});
	}

	return {
		u: userInfo,
		c: comparisonResult,
		user: locals.user
			? { i: locals.user.i, t: locals.user.t }
			: null,
		ld: local_description, // Pass local user's description
		it: user_items,
		r: results.map((u) => ({
			i: (u as any).i,
			t: u.t,
			a: u.a,
			g: u.g,
			av: (u as any).av
		}))
	};
};
