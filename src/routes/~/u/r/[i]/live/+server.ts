import type { RequestHandler } from './$types';
import { error, json, text } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { Room } from '$lib/types';
import { s } from '$lib/util/s';
import axios from 'axios';
import { realtime } from '$lib/util/realtime';

export const POST: RequestHandler = async ({
	params,
	locals,
	platform
}) => {
	const room_id = params.i;
	if (!room_id) throw error(400, 'missing room id');
	if (!locals.user || !locals.user.i)
		throw error(401, 'Unauthorized');

	// Load minimal room fields for access checks
	const r = await get<
		Pick<
			Room,
			'c' | '_' | 'u' | 'r' | 'x' | 'o' | 'q'
		>
	>(room_id, ['c', '_', 'u', 'r', 'q', 'x', 'o']);
	if (!r) throw error(404, 'room not found');

	// Access control mirroring +page.server
	switch (r._) {
		case ',': {
			const userRooms: string[] =
				((await get(locals.user.i, 'r')) as any) ||
				[];
			if (!userRooms.includes(room_id))
				throw error(
					403,
					'you do not belong to this room'
				);
			break;
		}
		case '|': {
			if (!r.x?.includes(locals.user.i))
				throw error(
					403,
					'you do not belong to this room'
				);
			break;
		}
		case '-': {
			if (
				!r.u ||
				!r.r ||
				(locals.user.i !== r.u &&
					locals.user.i !== r.r)
			) {
				throw error(
					403,
					'you do not belong to this room'
				);
			}
			break;
		}
	}

	let token = '';

	// Try to delegate to the bound Cloudflare service (preferred):
	try {
		const response = await realtime.post(
			'meetings/' + r.q + '/participants',
			{
				name: locals.user.t || 'Anonymous',
				picture: locals.user.p || '',
				preset_name: 'group_call_host',
				custom_participant_id: locals.user.i
			}
		);

		if (response.status !== 200)
			throw new Error('Failed to get token');
		const data = response.data;
		if (!data?.success)
			throw new Error('Invalid response');
		token = data.data.token;
	} catch (e) {
		console.warn('getting live token failed', e);
	}

	return text(token);
};
