import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { sendPushToUserId } from '$lib/server/push';
import { find_user_by_tag } from '$lib/db';

export const POST: RequestHandler = async ({
	params,
	request
}) => {
	try {
		const { user: tag } = params;
		const { userTag, chatId } = await request.json();
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
		if (!userTag)
			return json(
				{ error: 'missing userTag' },
				{ status: 400 }
			);

		const res = await sendPushToUserId(
			user.i,
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
