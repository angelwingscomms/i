import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import {
	get,
	new_id,
	search_by_payload
} from '$lib/db';
import type {
	ChatMessage,
	DBChatMessage,
	Room
} from '$lib/types';
import { s } from '$lib/util/s';
import { realtime } from '$lib/util/realtime';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	if (!params.i) error(400, 'missing room id');

	let anon = 0;

	const r = await get<
		Pick<
			Room,
			't' | 'c' | '_' | 'u' | 'r' | 'x' | 'q' | 'm'
		>
	>(params.i, [
		't',
		// 'c',
		'o',
		'_',
		'u',
		'q',
		'm',
		'r',
		'x'
	]);

	if (!r) error(404, 'room not found');

	// Check if user has access to this room
	if (locals.user) {
		switch (r._) {
			case ',': {
				const userRooms: string[] =
					(await get(locals.user.i, 'r')) || [];
				if (!userRooms.includes(params.i)) {
					error(
						403,
						'you do not belong to this room'
					);
				}
				break;
			}
			case '|': {
				if (!r.x?.includes(locals.user.i))
					error(
						403,
						'you do not belong to this room'
					);
				r.t =
					(await get<string>(
						r.x?.find((x) => x !== locals.user?.i) ||
							'',
						't'
					)) || '';
				break;
			}
			case '-': {
				if (
					!r.u ||
					!r.r ||
					(locals.user.i !== r.u &&
						locals.user.i !== r.r)
				) {
					error(
						403,
						'you do not belong to this room'
					);
				}
				if (locals.user.i === r.u) {
					anon = 1;
					r.t = (await get<string>(r.r!, 't')) || '';
				} else if (locals.user.i === r.r) {
					r.t = '';
				}
				break;
			}
		}
	}

	console.log('room', r);

	const realtime_res = await realtime.post(
		'meetings/' + r.q + '/participants',
		{
			name: locals.user?.t || 'Anonymous',
			// picture: locals.user?.p || '',
			preset_name: 'group_call_participant',
			custom_participant_id:
				locals.user?.i || new_id()
		}
	);

	console.log('rrr', r);

	const m = (await Promise.all(
		(
			await search_by_payload<
				DBChatMessage & { i: string; f?: string[] }
			>(
				{ s: 'm', r: params.i },
				['m', 'u', 'd', 'f'],
				72
				// {
				// 	key: 'd',
				// 	direction: 'desc'
				// }
			)
		).map(async (m) => ({
			...m,
			x: m.u
				? ((await get<string>(m.u, 't')) as string)
				: ''
		}))
	)) satisfies ChatMessage[];

	console.log('m', m.length);

	return {
		m,
		s: await s(),
		t: r.t ?? r.m,
		...(r.m ? { r: 1 } : {}),
		// c: '', // r.c,
		_: r._,
		a: anon,
		q: realtime_res.data.data.token
	};
};
