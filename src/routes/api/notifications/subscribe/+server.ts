import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { get, set } from '$lib/db';
import type { PushSubscription } from 'web-push';
import type { User } from '$lib/types';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		if (!locals.user) return json({ error: 'Unauthorized' }, { status: 401 });
		const sub = (await request.json()) as PushSubscription;
		if (!sub || !sub.endpoint)
			return json({ error: 'invalid subscription' }, { status: 400 });

		const now = Date.now();
		const subExp = (sub as unknown as { expirationTime?: number }).expirationTime;
		if (typeof subExp === 'number' && subExp > 0 && subExp < now) {
			// Expired; acknowledge but don't store
			return json({ ok: true, pruned: true });
		}

		const user_id = locals.user.i;
		const existing = (await get<User['ps']>(user_id, 'ps')) || [];
		const list: PushSubscription[] = Array.isArray(existing)
			? (existing as PushSubscription[])
			: existing
			? [(existing as unknown) as PushSubscription]
			: [];
		const non_expired = list.filter((s) => {
			const exp = (s as unknown as { expirationTime?: number }).expirationTime;
			return !(typeof exp === 'number' && exp > 0 && exp < now);
		});
		const updated = [
			...non_expired.filter((s) => s && s.endpoint !== sub.endpoint),
			sub
		];

		await set(user_id, { ps: updated });
		return json({ ok: true });
	} catch (e) {
		console.error('subscribe error', e);
		return json({ error: 'internal server error' }, { status: 500 });
	}
};
