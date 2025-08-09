import { create } from '$lib/db';
import type { RequestHandler } from './$types';
import type { ChatMessage, DBChatMessage, SendChatMessage } from '$lib/types';
import { s } from '$lib/util/s';
import { cf } from '$lib/util/cf';
import { PUBLIC_WORKER } from '$env/static/public';
import { get } from '$lib/db';
import type { User } from '$lib/types';
import { sendPushToUserId } from '$lib/server/push';

export const POST: RequestHandler = async ({ platform, request, params, locals }) => {
	const m: SendChatMessage = await request.json();

	const i = await create(
		{
			...(locals.user ? { u: locals.user.i } : {}),
			s: 'm',
			d: m.d,
			m: m.m,
			r: params.i
		} satisfies DBChatMessage,
		JSON.stringify({
			...(locals.user ? { sender: locals.user.t } : {}),
			receiver: m.t,
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
		}),
		m.i
	);

	cf(platform)('http' + PUBLIC_WORKER + '/send/' + m.c + (await s()), {
		method: 'POST',
		body: JSON.stringify({
			i,
			...(locals.user ? { x: locals.user.t } : {}),
			m: m.m
		} satisfies ChatMessage)
	});

    // After message is saved and broadcast, send push notif to receiving user (room id is params.i)
    try {
        const recipient = await get<User>(params.i);
        if (recipient?.i) {
            const title = `text from ${m.t}`;
            await sendPushToUserId(recipient.i, title, m.m, i);
        }
    } catch (err) {
        console.error('push notif error', err);
    }

	return new Response();
};
