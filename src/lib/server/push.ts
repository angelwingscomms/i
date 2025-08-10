import { get } from '$lib/db';
import type { User } from '$lib/types';
import { send_push_notif } from '$lib/util/send_push_notif';

export async function sendPushToUserId(
	userId: string,
	title: string,
	message: string,
	tag?: string
) {
	const user = await get<User>(userId);
	if (!user) {
		return { ok: false as const, status: 404, reason: 'user not found' };
	}
	if (!user.ps) {
		return { ok: false as const, status: 404, reason: 'no push sub on user' };
	}

	const notificationPayload = {
		title,
		body: message,
		icon: '/icon-192x192.png',
		badge: '/badge-72x72.png',
		tag,
		data: {
			userId,
			type: tag,
			timestamp: Date.now()
		}
	};

	await send_push_notif(user.ps as any, notificationPayload);
	return { ok: true as const };
}
