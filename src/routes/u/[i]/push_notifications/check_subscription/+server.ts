import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exists, get } from '$lib/db';

export const GET: RequestHandler = async ({ params }) => {
	const { i } = params;
	try {
		if (!i) return json({ error: 'missing user id' }, { status: 400 });
		if (!(await exists(i))) return json({ error: 'user not found' }, { status: 404 });

		// Check if user has a push subscription
		const user = await get(i, 'ps') as any;
		const subscribed = user && user.ps && user.ps.endpoint;

		return json({ subscribed });
	} catch (e) {
		console.error('check_subscription error', e);
		return json({ error: 'internal server error' }, { status: 500 });
	}
};
