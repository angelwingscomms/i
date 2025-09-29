// Client-only helper: ask server to send a push to the user's stored subscription (user.ps)
import { notif_debug } from '$lib/util/notif_debug';
export async function push_notif_to_user(
	userId: string,
	title: string,
	body: string,
	tag?: string
) {
	try {
		if (typeof window === 'undefined') {
			notif_debug(
				`push_notif_to_user skipped: server-side`
			);
			return;
		}
		notif_debug(
			`push_notif_to_user entry for ${userId}: title="${title}", body="${body}", tag="${tag || ''}"`
		);
		const response = await fetch(
			`/u/${userId}/push_notif`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					t: title,
					m: body,
					k: tag
				})
			}
		);
		if (response.ok) {
			notif_debug(
				`push_notif_to_user success for ${userId}: ${response.status}`
			);
		} else {
			notif_debug(
				`push_notif_to_user fetch failed for ${userId}: ${response.status} ${response.statusText}`
			);
		}
	} catch (err) {
		notif_debug(
			`push_notif_to_user error for ${userId}: ${err instanceof Error ? err.message : String(err)}`
		);
	}
}
