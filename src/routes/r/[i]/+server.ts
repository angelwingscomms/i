import { create, get } from '$lib/db';
import type { RequestHandler } from './$types';
import type { CreateChatMessage, SendChatMessage } from '$lib/types';
import { s } from '$lib/util/s';
import { cf } from '$lib/util/cf';
import { PUBLIC_WORKER } from '$env/static/public';

export const POST: RequestHandler = async ({ platform, request, params, locals }) => {
	const m: SendChatMessage = await request.json();
	const { c, t } = (await get(params.i, ['t', 'c'])) as { c: string; t: string };

	const i = await create(
		{
			...(locals.user ? { u: locals.user.i } : {}),
			s: 'm',
			d: m.d,
			t: m.t,
			r: params.i
		} satisfies CreateChatMessage,
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
			message_text: m.t,
			room_name_or_tag: t
		}),
		m.i
	);

	cf(platform)('http' + PUBLIC_WORKER + '/send/' + c + (await s()), {
		method: 'POST',
		body: JSON.stringify({
			i,
			...(locals.user ? { u: locals.user.t } : {}),
			t: m.t
		})
	});

	return new Response();
};
