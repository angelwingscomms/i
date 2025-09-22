import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { get, set } from '$lib/db';
import type { PushSubscription } from 'web-push';
import type { User } from '$lib/types';
import { notif_debug } from '$lib/util/notif_debug';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) {
			notif_debug('Subscribe POST: Unauthorized, no locals.user');
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
		const userId = locals.user.i;
		notif_debug(`Subscribe POST entry for user ${userId}`);
		const sub = (await request.json()) as PushSubscription;
		notif_debug(`Parsed sub for ${userId}: endpoint=${sub?.endpoint || 'missing'}`);
		if (!sub || !sub.endpoint) {
			notif_debug(`Invalid sub for ${userId}: no sub or endpoint`);
			return json({ error: 'invalid subscription' }, { status: 400 });
		}

		const now = Date.now();
		const subExp = (sub as unknown as { expirationTime?: number }).expirationTime;
		if (typeof subExp === 'number' && subExp > 0 && subExp < now) {
			notif_debug(`Sub expired for ${userId}: exp=${subExp}, now=${now}`);
			// Expired; acknowledge but don't store
			return json({ ok: true, pruned: true });
		}
		notif_debug(`Sub valid for ${userId}, no expiration issue`);

		const user_id = locals.user.i;
		const existing = (await get<User['ps']>(user_id, 'ps')) || [];
		const list: PushSubscription[] = Array.isArray(existing)
			? (existing as PushSubscription[])
			: existing
			? [(existing as unknown) as PushSubscription]
			: [];
		notif_debug(`Existing ps list for ${user_id}: length=${list.length}`);
		const non_expired = list.filter((s) => {
			const exp = (s as unknown as { expirationTime?: number }).expirationTime;
			return !(typeof exp === 'number' && exp > 0 && exp < now);
		});
		notif_debug(`Non-expired subs for ${user_id}: ${non_expired.length}/${list.length}`);
		const updated = [
			...non_expired.filter((s) => s && s.endpoint !== sub.endpoint),
			sub
		];
		notif_debug(`Updated ps list for ${user_id}: length=${updated.length}`);

		await set(user_id, { ps: updated });
		notif_debug(`Set ps for ${user_id} completed`);
		return json({ ok: true });
	} catch (e) {
		notif_debug(`Subscribe error for ${locals.user?.i || 'unknown'}: ${e instanceof Error ? e.message : String(e)}`);
		return json({ error: 'internal server error' }, { status: 500 });
	}
};
