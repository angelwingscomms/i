import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { get, search_by_payload } from '$lib/db';
import type { ChatMessage, DBChatMessage, Reaction, Attachment } from '$lib/types';
import { s } from '$lib/util/s';

export const load: PageServerLoad = async ({ params }) => {
	if (!params.i) error(400, 'missing room id');

	const r = await get<{ t: string; c: string }>(params.i, ['t', 'c']);
	if (!r) error(404, 'room not found');
	console.log('c', r.c);

	// Fetch latest messages for this room and shape to ChatMessage
	const raw = await search_by_payload<DBChatMessage & {
		i: string;
		v?: string;
		re?: Reaction[];
		rp?: string;
		e?: boolean;
		dl?: boolean;
		at?: Attachment[];
		mt?: 'text' | 'voice' | 'file'
	}>(
		{ s: 'm', r: params.i },
		['m', 'u', 'd', 'v', 're', 'rp', 'e', 'dl', 'at', 'mt'],
		72,
		{ key: 'd', direction: 'asc' }
	);

	const msgs: ChatMessage[] = await Promise.all(
		raw.map(async (m) => ({
			i: m.i,
			m: m.m,
			x: m.u ? ((await get<string>(m.u, 't')) as string) : undefined,
			...(m.v ? { v: m.v } : {}),
			...(m.re ? { re: m.re } : {}),
			...(m.rp ? { rp: m.rp } : {}),
			...(m.e ? { e: m.e } : {}),
			...(m.dl ? { dl: m.dl } : {}),
			...(m.at ? { at: m.at } : {}),
			...(m.mt ? { mt: m.mt } : {})
		}))
	);

	return { m: msgs, s: await s(), ...r, i: params.i };
};
