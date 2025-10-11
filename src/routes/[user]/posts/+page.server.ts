import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get, find_user_by_tag } from '$lib/db';
import type { User } from '$lib/types';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	const { user: tag } = params;
	if (!tag) error(400, 'missing user tag');
	const targetUser = await find_user_by_tag(tag);
	if (!targetUser || targetUser.s !== 'u')
		error(404, 'user not found');

	return {
		user: locals.user
			? { i: locals.user.i, t: locals.user.t }
			: null,
		targetUser
	};
};
