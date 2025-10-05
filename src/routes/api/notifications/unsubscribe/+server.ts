import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { get, set } from '$lib/db';
import type { PushSubscription } from '@block65/webcrypto-web-push';
import type { User } from '$lib/types';
import { notif_debug } from '$lib/util/notif_debug';

export const POST: RequestHandler = async ({
	request,
	locals
}) => {
	try {
		if (!locals.user) {
			notif_debug(
				'Unsubscribe POST: Unauthorized, no locals.user'
			);
			return json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}
		const userId = locals.user.i;
		notif_debug(
			`Unsubscribe POST entry for user ${userId}`
		);
		const sub =
			(await request.json()) as PushSubscription;
		notif_debug(
			`Parsed sub for ${userId}: endpoint=${sub?.endpoint || 'missing'}`
		);
		if (!sub || !sub.endpoint) {
			notif_debug(
				`Invalid sub for ${userId}: no sub or endpoint`
			);
			return json(
				{ error: 'invalid subscription' },
				{ status: 400 }
			);
		}

		const user_id = locals.user.i;
		const existing =
			(await get<User['ps']>(user_id, 'ps')) || [];
		const list: PushSubscription[] = Array.isArray(
			existing
		)
			? (existing as PushSubscription[])
			: existing
				? [existing as unknown as PushSubscription]
				: [];
		notif_debug(
			`Existing ps list for ${user_id}: length=${list.length}`
		);
		const updated = list.filter(
			(s) => s && s.endpoint !== sub.endpoint
		);
		notif_debug(
			`Updated ps list after remove for ${user_id}: length=${updated.length}`
		);
		await set(user_id, {
			ps: updated.length ? updated : null
		});
		notif_debug(
			`Set ps for ${user_id} after unsubscribe completed`
		);
		return json({ ok: true });
	} catch (e) {
		notif_debug(
			`Unsubscribe error for ${locals.user?.i || 'unknown'}: ${e instanceof Error ? e.message : String(e)}`
		);
		return json(
			{ error: 'internal server error' },
			{ status: 500 }
		);
	}
};
