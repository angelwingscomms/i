import { collection } from '$lib/constants';
import { get, qdrant, set } from '$lib/db';
import { realtime } from '$lib/util/realtime';
import { redirect, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) redirect(302, '/google');

	const res = await qdrant.query(collection, {
		filter: {
			is_empty: { key: 'f' }
		},
		query:
			(await get<{ vector: number[] }>(locals.user.i, false, true))?.vector ||
			new Array(3072).fill(0),
		with_payload: false
	});
	if (res.points.length && res.points[0].payload?.r) {
		set(res.points[0].id as string, { f: '' });
		set(locals.user.i, { f: '' });
		const realtime_res = (
			await realtime.post('meetings/' + res.points[0].payload?.r + '/participants', {
				name: locals.user?.t || 'Anonymous',
				// picture: locals.user?.p || '',
				preset_name: 'group_call_participant',
				custom_participant_id: locals.user?.i
			})
		).data.data.token;
		return text(realtime_res);
	} else {
		const create_meeting_res = (await realtime.post('meetings', { title: '' })).data.data.id;
		await set(locals.user.i, { r: create_meeting_res });
		const realtime_res = (
			await realtime.post('meetings/' + create_meeting_res + '/participants', {
				name: locals.user?.t || 'Anonymous',
				// picture: locals.user?.p || '',
				preset_name: 'group_call_participant',
				custom_participant_id: locals.user?.i
			})
		).data.data.token;
		return text(realtime_res);
	}
};

/**
 * create meeting for user
 * user joins meeting
 * search for users
 * get meeting deets from first result
 * join other user meeting
 * close self meeting
 *
 */
