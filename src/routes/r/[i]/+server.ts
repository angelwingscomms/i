import { create } from '$lib/db';
import type { RequestHandler } from './$types';
import type { ChatMessage, DBChatMessage, SendChatMessage } from '$lib/types';
import { s } from '$lib/util/s';
import { cf } from '$lib/util/cf';
import { PUBLIC_WORKER } from '$env/static/public';

export const POST: RequestHandler = async ({ platform, request, params, locals }) => {
	const m: SendChatMessage = await request.json();

	const messageData = {
		...(locals.user ? { u: locals.user.i } : {}),
		s: 'm',
		d: m.d,
		m: m.m,
		r: params.i
	} satisfies DBChatMessage;

	const i = await create(
		messageData,
		JSON.stringify({
			...(locals.user ? { sender: locals.user.t } : {}),
			sent_at: new Date(m.d).toLocaleString(undefined, {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			}),
			message_text: m.m,
			room_name_or_tag: m.t,
		}),
		m.i
	);

	cf(platform)('http' + PUBLIC_WORKER + '/send/' + m.c + (await s()), {
		method: 'POST',
		body: JSON.stringify({
			type: 'message',
			i,
			...(locals.user ? { x: locals.user.t } : {}),
			m: m.m,
		} satisfies ChatMessage & { type: string })
	});

	// // Server-side push notification: resolve recipient by tag and notify if found
	// try {
	// 	if (m.t) {
	// 		const recipient = await find_user_by_tag(m.t);
	// 		if (recipient?.i) {
	// 			await fetch('/push_notif', {
	// 				method: 'POST',
	// 				headers: { 'Content-Type': 'application/json' },
	// 				body: JSON.stringify({ u: recipient.i, t: `New message in ${m.t}`, m: m.m, k: i })
	// 			});
	// 		}
	// 	}
	// } catch (err) {
	// 	console.error('push notif error', err);
	// }

	return new Response();
};
