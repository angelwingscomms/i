import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { search_by_payload, get } from '$lib/db';
import type { ChatMessage, DBChatMessage } from '$lib/types';
import { s } from '$lib/util/s';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(302, '/google?next=/i/c');

	// Fetch latest messages for this user's AI chat (use r = user id)
	const raw = await search_by_payload<DBChatMessage & { i: string }>(
		{ s: 'm', r: locals.user.i },
		['m', 'u', 'd'],
		72,
		{ key: 'd', direction: 'asc' }
	);

	const msgs: ChatMessage[] = await Promise.all(
		raw.map(async (m) => ({
			i: m.i,
			m: m.m,
			x: m.u ? ((await get<string>(m.u, 't')) as string) : undefined
		}))
	);

	return { m: msgs, s: await s() };
};

