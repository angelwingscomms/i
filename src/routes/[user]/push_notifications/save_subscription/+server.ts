import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	exists,
	get,
	set,
	find_user_by_tag
} from '$lib/db';
import type { User } from '$lib/types';
import type { PushSubscription } from 'web-push';

export const POST: RequestHandler = async ({
	params,
	request
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
			return json('user not found', { status: 404 });

		const sub = await request.json();
		if (!sub || !sub.endpoint)
			return json(
				{ error: 'invalid subscription' },
				{ status: 400 }
			);

		// Load existing subscriptions and merge/deduplicate by endpoint
		const existing =
			(await get<User['ps']>(user.i, 'ps')) || [];
		const list: PushSubscription[] = Array.isArray(
			existing
		)
			? (existing as PushSubscription[])
			: existing
				? [existing as unknown as PushSubscription]
				: [];
		const withoutDupes = list.filter(
			(s) => s && s.endpoint !== sub.endpoint
		);
		const updated = [...withoutDupes, sub];

		await set(user.i, { ps: updated });

		// Log successful subscription save
		// console.log('🔔 Push notification subscription saved on server:', {
		// 	userId: i,
		// 	endpoint: sub.endpoint,
		// 	hasKeys: sub.keys ? 'yes' : 'no',
		// 	p256dh: sub.keys?.p256dh ? 'present' : 'missing',
		// 	auth: sub.keys?.auth ? 'present' : 'missing',
		// 	timestamp: new Date().toISOString()
		// });

		return new Response();
	} catch (e) {
		console.error('save_subscription error', e);
		return json(
			{ error: 'internal server error' },
			{ status: 500 }
		);
	}
};
