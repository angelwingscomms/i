import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendPushToUserId } from '$lib/server/push';
import { get } from '$lib/db';

export const POST: RequestHandler = async ({
	params,
	request
}) => {
	try {
		const { i } = params;
		const { userTag, chatId } = await request.json();
		if (!i)
			return json(
				{ error: 'missing user id' },
				{ status: 400 }
			);
		const user = await get(i);
		if (!user)
			return json(
				{ error: 'user not found' },
				{ status: 404 }
			);
		if (!userTag)
			return json(
				{ error: 'missing userTag' },
				{ status: 400 }
			);

		const res = await sendPushToUserId(
			i,
			userTag,
			chatId
		);
		if (!res.ok)
			return new Response(res.reason, {
				status: res.status
			});
		return json({
			message: 'Push notification sent'
		});
	} catch (error) {
		console.error('push_notif error', error);
		return json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
};
