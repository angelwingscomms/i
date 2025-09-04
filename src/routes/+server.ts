import { collection } from '$lib/constants';
import { get, qdrant, set } from '$lib/db';
import { realtime } from '$lib/util/realtime';
import { error, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, request }) => {
	const deets: { n: number; x: number; g: number } = await request.json();
	if (!locals.user) error(401, 'Unauthorized');
	const must = [{ key: 'f', match: { value: 1 } }];

	if (deets.g != null) {
		if (deets.g !== 0 && deets.g !== 1) {
			return error(400, 'Invalid gender');
		}
		must.push({ key: 'g', match: { value: deets.g } });
	}
	const age_range: { gte?: number; lte?: number } = {};
	if (deets.x != null) {
		if (isNaN(deets.x)) {
			return error(400, 'Invalid max age');
		}
		age_range.lte = deets.x;
	}
	if (deets.n != null) {
		if (isNaN(deets.n)) {
			return error(400, 'Invalid min age');
		}
		age_range.gte = deets.n;
	}
	if (Object.keys(age_range).length) {
		must.push({ key: 'a', range: age_range });
	}
	const res = await qdrant.query(collection, {
		filter: {
			must,
			must_not: { has_id: [locals.user.i] }
		},
		query:
			(await get<{ vector: number[] }>(locals.user.i, false, true))?.vector ||
			new Array(3072).fill(0),
		with_payload: ['r'],
		limit: 1
	});
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
