import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	exists,
	get,
	find_user_by_tag
} from '$lib/db';
import type { User } from '$lib/types';

export const GET: RequestHandler = async ({
	params
}) => {
	const { user: tag } = params;
	try {
		if (!tag)
			return json(
				{ error: 'missing user tag' },
				{ status: 400 }
			);
		const user = await find_user_by_tag(tag);
		if (!user)
			return json(
				{ error: 'user not found' },
				{ status: 404 }
			);

		// Check if user has any push subscription
		const ps = await get<User['ps']>(user.i, 'ps');
		const list = Array.isArray(ps)
			? ps
			: ps
				? [ps as any]
				: [];
		const subscribed = list.length > 0;

		return json({ subscribed });
	} catch (e) {
		console.error('check_subscription error', e);
		return json(
			{ error: 'internal server error' },
			{ status: 500 }
		);
	}
};
