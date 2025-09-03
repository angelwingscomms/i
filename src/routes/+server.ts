import { collection } from '$lib/constants';
import { get, qdrant, set } from '$lib/db';
import { realtime } from '$lib/util/realtime';
import { error, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) error(401, 'Unauthorized');
	const res = await qdrant.query(collection, {
		filter: {
			must: { key: 'f', match: { value: 1 } },
			must_not: { has_id: [locals.user.i] }
		},
		query:
			(await get<{ vector: number[] }>(locals.user.i, false, true))?.vector ||
			new Array(3072).fill(0),
		with_payload: ['r'],
		limit: 1
	});
	console.log('search res', res.points);
	if (res.points.length && res.points[0].payload?.r) {
		set(res.points[0].id as string, { f: '' });
		set(locals.user.i, { f: '' });
		return text(
			(
				await realtime.post('meetings/' + res.points[0].payload?.r + '/participants', {
					name: locals.user?.t || 'Anonymous',
					// picture: locals.user?.p || '',
					preset_name: 'group_call_participant',
					custom_participant_id: locals.user?.i
				})
			).data.data.token
		);
	} else {
		await set(locals.user.i, { f: 1 });
		return text(
			(
				await realtime.post('meetings/' + (await get(locals.user?.i, 'r')) + '/participants', {
					name: locals.user?.t || 'Anonymous',
					// picture: locals.user?.p || '',
					preset_name: 'group_call_participant',
					custom_participant_id: locals.user?.i
				})
			).data.data.token
		);
	}
};
