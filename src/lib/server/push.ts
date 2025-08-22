import { get } from '$lib/db';
import type { User } from '$lib/types';
import { send_push_notif } from '$lib/util/send_push_notif';

export async function sendPushToUserId(userId: string, userTag: string, chatId?: string) {
	const user_sub = await get<User>(userId, 'ps');
	if (!user_sub) {
		return { ok: false as const, status: 404, reason: 'user not found' };
	}

	const notificationPayload = {
		userTag,
		chatId
	};

	await send_push_notif(user_sub as any, notificationPayload);
	return { ok: true as const };
}
