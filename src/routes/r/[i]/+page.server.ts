import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { search_by_payload } from '$lib/db';
import type { ChatMessage } from '$lib/types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!params.i) throw error(400, 'Missing room id');

	if (!locals.user) throw error(401, 'Unauthorized');

	const msgs = await search_by_payload<ChatMessage>({ s: 'm', r: params.i }, 72);

	msgs.sort((a, b) => new Date(a.d).getTime() - new Date(b.d).getTime());

	return { m: msgs };
};
