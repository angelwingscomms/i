import { create, get } from '$lib/db';
import type { RequestHandler } from './$types';
import type { CreateChatMessage, SendChatMessage } from '$lib/types';
import { s } from '$lib/util/s';

export const POST: RequestHandler = async ({ platform, request, params, locals }) => {
	console.log('platform.env.r.fetch', platform.env.r.fetch);
	const m: SendChatMessage = await request.json();
	const { c, t } = await get<{ c: string; t: string }>(params.i, ['c', 't']);

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

	platform.env.R.fetch('https://i.i/send/' + (await s()));

	// await axios.post('http' + PUBLIC_WORKER + '/send/' + params.i, {
	// 	i,
	// 	...(locals.user ? { u: locals.user.t } : {}),
	// 	t: m.t
	// });

	return new Response();
};
