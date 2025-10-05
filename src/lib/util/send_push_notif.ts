import { VAPID_PRIVATE_KEY } from '$env/static/private';
import { PUBLIC_VAPID_KEY } from '$env/static/public';
import {
	buildPushPayload,
	type PushSubscription
} from '@block65/webcrypto-web-push'; // New import
import { notif_debug } from '$lib/util/notif_debug';

notif_debug(
	`VAPID keys loaded: public=${!!PUBLIC_VAPID_KEY}, private=${!!VAPID_PRIVATE_KEY}`
);

export const send_push_notif = async (
	subscription: PushSubscription,
	body: object
) => {
	try {
		const bodyKeys = Object.keys(body).join(', ');
		notif_debug(
			`send_push_notif entry: endpoint=${subscription.endpoint}, body keys=${bodyKeys}`
		);

		// Prepare VAPID keys (subject is your contact email)
		const vapid = {
			subject: 'mailto:edge37@outlook.com',
			publicKey: PUBLIC_VAPID_KEY,
			privateKey: VAPID_PRIVATE_KEY
		};

		// Prepare the message (data as JSON string; add options like ttl if needed)
		const message = {
			data: JSON.stringify(body)
			// options: { ttl: 60 } // Example: optional TTL in seconds
		};

		// Build the payload (handles encryption, headers, etc.)
		const payload = await buildPushPayload(
			message,
			subscription,
			vapid
		);

		// Send via fetch (Workers-compatible)
		const res = await fetch(subscription.endpoint, {
			...payload,
			body: payload.body as any
		});

		notif_debug(
			`send_push_notif success: status=${res.status}, endpoint=${subscription.endpoint}`
		);
		return res;
	} catch (err) {
		notif_debug(
			`send_push_notif error for endpoint=${subscription.endpoint}: ${err instanceof Error ? err.message : String(err)}, full err=${JSON.stringify(err)}`
		);
		throw err;
	}
};
