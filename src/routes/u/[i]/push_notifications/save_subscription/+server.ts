import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exists, set } from '$lib/db';

export const POST: RequestHandler = async ({ params, request }) => {
	const { i } = params;
	try {
		if (!i) return json({ error: 'missing user id' }, { status: 400 });
		if (!(await exists(i))) return json('user not found', { status: 404 });

		const sub = await request.json();
		if (!sub || !sub.endpoint) return json({ error: 'invalid subscription' }, { status: 400 });

		await set(i, { ps: sub });

		// Log successful subscription save
		console.log('🔔 Push notification subscription saved on server:', {
			userId: i,
			endpoint: sub.endpoint,
			hasKeys: sub.keys ? 'yes' : 'no',
			p256dh: sub.keys?.p256dh ? 'present' : 'missing',
			auth: sub.keys?.auth ? 'present' : 'missing',
			timestamp: new Date().toISOString()
		});

		return new Response();
	} catch (e) {
		console.error('save_subscription error', e);
		return json({ error: 'internal server error' }, { status: 500 });
	}
};
