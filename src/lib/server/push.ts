import { get, set } from '$lib/db';
import type { User } from '$lib/types';
import { send_push_notif } from '$lib/util/send_push_notif';
import type { PushSubscription } from 'web-push';
import { notif_debug } from '$lib/util/notif_debug';

export async function sendPushToUserId(
	userId: string,
	userTag: string,
	chatId?: string
) {
	notif_debug(`sendPushToUserId entry: userId=${userId}, userTag=${userTag}, chatId=${chatId || 'none'}`);
	const ps = await get<User['ps']>(userId, 'ps');
	if (!ps) {
		notif_debug(`sendPushToUserId: no ps for user ${userId}`);
		return {
			ok: false as const,
			status: 404,
			reason: 'user not found'
		};
	}
	notif_debug(`sendPushToUserId: fetched ps for ${userId}, value=${JSON.stringify(ps)}`);

	const list: PushSubscription[] = Array.isArray(ps)
		? (ps as PushSubscription[])
		: [ps as unknown as PushSubscription];
	notif_debug(`sendPushToUserId: ps list length for ${userId}: ${list.length}`);

	// Prune expired before sending
	const now = Date.now();
	const nonExpired = list.filter((s) => {
		const exp = (s as unknown as { expirationTime?: number }).expirationTime;
		return !(typeof exp === 'number' && exp > 0 && exp < now);
	});
	const prunedCount = list.length - nonExpired.length;
	if (prunedCount > 0) {
		notif_debug(`sendPushToUserId: pruned ${prunedCount} expired subs for ${userId}`);
		await set(userId, { ps: nonExpired.length ? nonExpired : null });
	}
	notif_debug(`sendPushToUserId: non-expired subs for ${userId}: ${nonExpired.length}`);

	if (nonExpired.length === 0) {
		notif_debug(`sendPushToUserId: no non-expired subs for ${userId}`);
		return {
			ok: false as const,
			status: 404,
			reason: 'no subscriptions'
		};
	}

	const notificationPayload = {
		userTag,
		chatId
	};
	notif_debug(`sendPushToUserId: payload prepared for ${userId}: ${JSON.stringify(notificationPayload)}`);

	const results = await Promise.allSettled(
		nonExpired.map((subscription) => {
			notif_debug(`sendPushToUserId: attempting send to endpoint=${subscription.endpoint} for ${userId}`);
			return send_push_notif(
				subscription,
				notificationPayload
			);
		})
	);

	// Prune gone/invalid subscriptions post-send
	const kept: PushSubscription[] = [];
	results.forEach((res, idx) => {
		const sub = nonExpired[idx];
		if (res.status === 'fulfilled') {
			notif_debug(`sendPushToUserId: send success for endpoint=${sub.endpoint}`);
			kept.push(sub);
		} else {
			const reason = res.reason;
			notif_debug(`sendPushToUserId: send failed for endpoint=${sub.endpoint}: ${reason instanceof Error ? reason.message : String(reason)}`);
			if (reason && (reason.statusCode === 404 || reason.statusCode === 410 || reason.status === 404 || reason.status === 410)) {
				notif_debug(`sendPushToUserId: pruning invalid sub endpoint=${sub.endpoint} for ${userId}`);
			}
		}
	});

	if (kept.length !== nonExpired.length) {
		const prunedPostSend = nonExpired.length - kept.length;
		notif_debug(`sendPushToUserId: pruning ${prunedPostSend} invalid subs for ${userId}`);
		await set(userId, { ps: kept.length ? kept : null });
	}
	notif_debug(`sendPushToUserId: final kept subs for ${userId}: ${kept.length}`);

	return { ok: true as const };
}
