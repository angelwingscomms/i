import { json } from '@sveltejs/kit';
import { searchByPayload } from '$lib/db';
import type { RequestHandler } from './$types';
import type { NotificationSubscription } from '$lib/types';
import { send_push_notif } from '$lib/util/send_push_notif';

// VAPID keys - In production, these should be environment variables
const PUBLIC_VAPID_KEY =
	'BEl62iUYgUivxIkv69yViEuiBIa40HcCWLEaQK07x8hiKSHjfcHqLm1kZHLQjF4rXYJd4BPZ09lS1P9_4M4CsUg';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { u, m, t, k } = await request.json();
		;
		const subscriptions =
			await searchByPayload<NotificationSubscription>({
				s: 'n',
				u: u
			});
		;

		if (subscriptions.length === 0) {
			return json(
				{ message: 'No active subscriptions found' },
				{ status: 200 }
			);
		}

		const notificationPayload = {
			title: t,
			body: m,
			icon: '/icon-192x192.png',
			badge: '/badge-72x72.png',
			tag: k,
			data: {
				userId: u,
				type: k,
				timestamp: Date.now()
			}
		};

		const pushPromises = subscriptions.map(async (subscription) => {
			;
			try {
				console.log(
					'Sending push notification to:',
					subscription.sub.endpoint
				);
				;

				send_push_notif(subscription.sub, notificationPayload);

				return { success: true, endpoint: subscription.sub.endpoint };
			} catch (error) {
				console.error('Failed to send push notification:', error);
				return {
					success: false,
					endpoint: subscription.sub.endpoint,
					error
				};
			}
		});

		const results = await Promise.all(pushPromises);
		const successful = results.filter((r) => r.success).length;
		const failed = results.filter((r) => !r.success).length;

		return json({
			message: 'Push notifications sent',
			successful,
			failed,
			results
		});
	} catch (error) {
		console.error('Push notification error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

// GET endpoint to retrieve VAPID public key
export const GET: RequestHandler = async () => {
	return json({
		publicKey: PUBLIC_VAPID_KEY
	});
};
