import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exists, get } from '$lib/db';
import type { User } from '$lib/types';

export const GET: RequestHandler = async ({ params }) => {
	const { i } = params;
	try {
		if (!i) return json({ error: 'missing user id' }, { status: 400 });
		if (!(await exists(i))) return json({ error: 'user not found' }, { status: 404 });

		// Check if user has any push subscription
		const ps = await get<User['ps']>(i, 'ps');
		const list = Array.isArray(ps) ? ps : ps ? [ps as any] : [];
		const subscribed = list.length > 0;

		return json({ subscribed });
	} catch (e) {
		console.error('check_subscription error', e);
		return json({ error: 'internal server error' }, { status: 500 });
	}
};
