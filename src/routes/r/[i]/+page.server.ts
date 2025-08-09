import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { get, search_by_payload } from '$lib/db';
import type { ChatMessage, DBChatMessage } from '$lib/types';
import { s } from '$lib/util/s';

export const load: PageServerLoad = async ({ params }) => {
	if (!params.i) error(400, 'missing room id');

	const r = await get<{ t: string; c: string }>(params.i, ['t', 'c']);
	if (!r) error(404, 'room not found');
	console.log('c', r.c);

	const msgs: ChatMessage[] = await Promise.all(
		(
			await search_by_payload<DBChatMessage & { i: string }>(
				{ s: 'm', r: params.i },
				['m', 'u'],
				72
			)
		).map(async (m) => ({
			...m,
			u: (await get<string>(m.u, 't')) as string
		}))
	);

	return { m: msgs, s: await s(), ...r };
};
