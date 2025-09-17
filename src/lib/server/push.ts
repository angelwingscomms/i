import { get, set } from '$lib/db';
import type { User } from '$lib/types';
import { send_push_notif } from '$lib/util/send_push_notif';
import type { PushSubscription } from 'web-push';

export async function sendPushToUserId(userId: string, userTag: string, chatId?: string) {
	const ps = await get<User['ps']>(userId, 'ps');
	if (!ps) {
		return { ok: false as const, status: 404, reason: 'user not found' };
	}

	const list: PushSubscription[] = Array.isArray(ps) ? (ps as any) : [ps as any];
	if (list.length === 0) {
		return { ok: false as const, status: 404, reason: 'no subscriptions' };
	}

	const notificationPayload = {
		userTag,
		chatId
	};

	const results = await Promise.allSettled(
		list.map((subscription) => send_push_notif(subscription as any, notificationPayload))
	);

	// Prune gone/invalid subscriptions
	const pruned: PushSubscription[] = [];
	results.forEach((res, idx) => {
		if (res.status === 'fulfilled') {
			pruned.push(list[idx]);
		} else {
			const err = res.reason;
			// If the endpoint is gone, skip keeping it
			console.warn('push send failed; pruning subscription', err);
		}
	});

	if (pruned.length !== list.length) {
		await set(userId, { ps: pruned.length ? pruned : null });
	}

	return { ok: true as const };
}
