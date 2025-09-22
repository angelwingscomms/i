import { VAPID_PRIVATE_KEY } from '$env/static/private';
import { PUBLIC_VAPID_KEY } from '$env/static/public';
import webpush, {
	type PushSubscription
} from 'web-push';
import { notif_debug } from '$lib/util/notif_debug';

notif_debug(`VAPID keys loaded: public=${!!PUBLIC_VAPID_KEY}, private=${!!VAPID_PRIVATE_KEY}`);

webpush.setVapidDetails(
	'mailto:edge37@outlook.com',
	PUBLIC_VAPID_KEY,
	VAPID_PRIVATE_KEY
);

export const send_push_notif = async (
	subscription: PushSubscription,
	body: object
) => {
	try {
		const bodyKeys = Object.keys(body).join(', ');
		notif_debug(`send_push_notif entry: endpoint=${subscription.endpoint}, body keys=${bodyKeys}`);
		const res = await webpush.sendNotification(
			subscription,
			JSON.stringify(body)
		);
		notif_debug(`send_push_notif success: status=${res.statusCode}, endpoint=${subscription.endpoint}`);
		return res;
	} catch (err) {
		notif_debug(`send_push_notif error for endpoint=${subscription.endpoint}: ${err instanceof Error ? err.message : String(err)}, full err=${JSON.stringify(err)}`);
		throw err;
	}
};
