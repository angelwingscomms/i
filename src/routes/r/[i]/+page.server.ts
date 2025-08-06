import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { get, search_by_payload } from '$lib/db';
import type { SendChatMessage, ChatMessage } from '$lib/types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!params.i) error(400, 'Missing room id');

	const r = await get<{ t: string }>(params.i, ['t']);
	if (!r) error(404, 'room not found');

	const msgs: ChatMessage[] = await Promise.all(
		(await search_by_payload<ChatMessage>({ s: 'm', r: params.i }, ['t', 'u'], 72)).map(async (m) => ({
			...m,
			u: (await get<string>(m.u, ['t'])) as string
		}))
	);

	return { m: msgs, t: r.t };
};
