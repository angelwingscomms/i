import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get } from '$lib/db';
import type { User } from '$lib/types';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	const { i } = params;
	if (!i) error(400, 'missing user id');
	const targetUserRaw =
		await get<Record<string, unknown>>(i);
	if (
		!targetUserRaw ||
		(targetUserRaw as any).s !== 'u'
	)
		error(404, 'user not found');

	const targetUser: User = {
		...targetUserRaw,
		i
	} as User;

	return {
		user: locals.user
			? { i: locals.user.i, t: locals.user.t }
			: null,
		targetUser
	};
};
