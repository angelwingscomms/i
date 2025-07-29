import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get } from '$lib/db';
import type { User } from '$lib/types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		redirect(302, '/google');
	}

	const { id } = params;

	try {
		// Get the other user by ID
		const otherUser = await get<User>(id);

		if (!otherUser) {
			throw error(404, 'User not found');
		}

		// Prevent users from chatting with themselves
		if (otherUser.i === locals.user.i) {
			redirect(302, `/user/${id}`);
		}

		return {
			user: {
				id: locals.user.i,
				tag: locals.user.t,
				description: locals.user.d
			},
			otherUser: {
				id: otherUser.i,
				tag: otherUser.t,
				age: otherUser.a,
				gender: otherUser.g
			}
		};
	} catch (err) {
		console.error('Error loading chat:', err);
		throw error(500, 'Failed to load chat');
	}
};
