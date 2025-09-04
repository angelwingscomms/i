import { collection } from '$lib/constants';
import { get, qdrant, set } from '$lib/db';
import { realtime } from '$lib/util/realtime';
import { error, text } from '@sveltejs/kit';
import { v7 } from 'uuid';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, request }) => {
	const url = new URL(request.url);
	const deets: { n?: number; x?: number; g?: number } = {};
	if (url.searchParams.has('n')) {
		deets.n = Number(url.searchParams.get('n'));
	}
	if (url.searchParams.has('x')) {
		deets.x = Number(url.searchParams.get('x'));
	}
	if (url.searchParams.has('g')) {
		deets.g = Number(url.searchParams.get('g'));
	}
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
		const other_user = await get<{ a: number; g: number; vector: number[] }>(res.points[0].id as string, ['a', 'g'], true);
		const self = await get<{ a: number; g: number; vector: number[] }>(locals.user.i, ['a', 'g'], true);
		// if (!other_user) return error(500, 'otf');
		// if (!self) return error(500, 'stf');
		await qdrant.upsert(collection, {
			points: [
				{
					id: v7(),
					payload: {
						s: 'j',
						u: locals.user.i,
						r: res.points[0].id as string,
						d: Date.now(),
						a: other_user.a,
						g: other_user.g
					},
					vector: other_user.vector
				},
				{
					id: v7(),
					payload: {
						s: 'j',
						u: res.points[0].id,
						r: locals.user.i,
						d: Date.now(),
						a: self.a,
						g: self.g
					},
					vector: self.vector
				}
			],
			wait: true
		});
		// Get current friends lists
		const [self_friends, other_friends] = await Promise.all([
			get<{f: string[]}>(locals.user.i, ['f']),
			get<{f: string[]}>(res.points[0].id as string, ['f'])
		]);

		// Update friends lists with new connections
		const updated_self_friends = [...(self_friends?.f || []), res.points[0].id];
		const updated_other_friends = [...(other_friends?.f || []), locals.user.i];

		// Set updated friends lists
		await Promise.all([
			set(locals.user.i, { f: updated_self_friends }),
			set(res.points[0].id as string, { f: updated_other_friends })
		]);
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
