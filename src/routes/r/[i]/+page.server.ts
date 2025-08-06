import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { get, search_by_payload } from '$lib/db';
import type { ChatMessage, Message } from '$lib/types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!params.i) error(400, 'Missing room id');

	const r = await get<{ t: string }>(params.i, ['t']);
	if (!r) error(404, 'room not found')

	const msgs: Message[] = await search_by_payload<ChatMessage>({ s: 'm', r: params.i }, [mt, ] ,72);

	msgs.sort((a, b) => new Date(a.d).getTime() - new Date(b.d).getTime());

	return { m: msgs, t: r.t };
};
