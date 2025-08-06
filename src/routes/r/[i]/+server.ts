import { create, get } from '$lib/db';
import axios from 'axios';
import type { RequestHandler } from './$types';
import { PUBLIC_WORKER } from '$env/static/public';
import type { CreateChatMessage, SendChatMessage } from '$lib/types';

export const POST: RequestHandler = async ({ request, params, locals }) => {
	const m: SendChatMessage = await request.json();
	const rt = await get(params.i, 't');

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
			room_name_or_tag: rt
		}), m.i
	);

	await axios.post('http' + PUBLIC_WORKER + '/send/' + params.i, {
		i,
		...(locals.user ? { u: locals.user.t } : {}),
		t: m.t
	});

	return new Response();
};
