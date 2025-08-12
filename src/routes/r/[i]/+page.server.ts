import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { get, search_by_payload } from '$lib/db';
import type { ChatMessage, DBChatMessage } from '$lib/types';
import { s } from '$lib/util/s';

export const load: PageServerLoad = async ({ params }) => {
	if (!params.i) error(400, 'missing room id');

	const r = await get<{ t: string; c: string }>(params.i, ['t', 'c']);
	if (!r) error(404, 'room not found');

	return {
		m: (await Promise.all(
			(
				await search_by_payload<DBChatMessage & { i: string }>(
					{ s: 'm', r: params.i },
					['m', 'u', 'd'],
					72,
					{
						key: 'd',
						direction: 'asc'
					}
				)
			).map(async (m) => ({
				...m,
				x: m.u ? ((await get<string>(m.u, 't')) as string) : ''
			}))
		)) satisfies ChatMessage[],
		s: await s(),
		...r
	};
};
