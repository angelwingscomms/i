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

		const user_id = locals.user.i;
		const existing = (await get<User['ps']>(user_id, 'ps')) || [];
		const list: PushSubscription[] = Array.isArray(existing)
			? (existing as PushSubscription[])
			: existing
			? [(existing as unknown) as PushSubscription]
			: [];
		const updated = list.filter((s) => s && s.endpoint !== sub.endpoint);
		await set(user_id, { ps: updated.length ? updated : null });
		return json({ ok: true });
	} catch (e) {
		console.error('unsubscribe error', e);
		return json({ error: 'internal server error' }, { status: 500 });
	}
};
