import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { get, search_by_payload } from '$lib/db';
import type { ChatMessage } from '$lib/types';
import { SECRET } from '$env/static/private';

export const load: PageServerLoad = async ({ params }) => {
	if (!params.i) error(400, 'missing room id');

	const r = await get<{ t: string }>(params.i, ['t']);
	if (!r) error(404, 'room not found');

	const msgs: ChatMessage[] = await Promise.all(
		(await search_by_payload<ChatMessage>({ s: 'm', r: params.i }, ['t', 'u'], 72)).map(
			async (m) => ({
				...m,
				u: (await get<string>(m.u, 't')) as string
			})
		)
	);

	const raw = new TextEncoder().encode(SECRET);
	const key = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, [
		'sign',
		'verify'
	]);

	const s = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(""));

	return { m: msgs, t: r.t, s };
};
