import { collection } from '$lib/constants';
import { get, qdrant, set } from '$lib/db';
import { realtime } from '$lib/util/realtime';
import { error, text } from '@sveltejs/kit';
import { v7 } from 'uuid';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, request }) => {
	try {
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

		let res;
		try {
			res = await qdrant.query(collection, {
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
		} catch (err) {
			console.error('Failed to query qdrant:', err);
			throw error(500, 'Failed to query database');
		}

		if (res.points.length && res.points[0].payload?.r) {
			try {
				await Promise.all([
					set(res.points[0].id as string, { f: '' }),
					set(locals.user.i, { f: '' })
				]);
			} catch (err) {
				console.error('Failed to set initial f values:', err);
				throw error(500, 'Failed to update user status');
			}

			let other_user, self;
			try {
				[other_user, self] = await Promise.all([
					get<{ a: number; g: number; vector: number[] }>(res.points[0].id as string, ['a', 'g'], true),
					get<{ a: number; g: number; vector: number[] }>(locals.user.i, ['a', 'g'], true)
				]);
			} catch (err) {
				console.error('Failed to get user data:', err);
				throw error(500, 'Failed to fetch user data');
			}

			try {
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
			} catch (err) {
				console.error('Failed to upsert match data:', err);
				throw error(500, 'Failed to save match data');
			}

			let self_friends, other_friends;
			try {
				[self_friends, other_friends] = await Promise.all([
					get<{f: string[]}>(locals.user.i, ['f']),
					get<{f: string[]}>(res.points[0].id as string, ['f'])
				]);
			} catch (err) {
				console.error('Failed to get friends lists:', err);
				throw error(500, 'Failed to fetch friends data');
			}

			const updated_self_friends = [...(self_friends?.f || []), res.points[0].id];
			const updated_other_friends = [...(other_friends?.f || []), locals.user.i];

			try {
				await Promise.all([
					set(locals.user.i, { f: updated_self_friends }),
					set(res.points[0].id as string, { f: updated_other_friends })
				]);
			} catch (err) {
				console.error('Failed to update friends lists:', err);
				throw error(500, 'Failed to update friends lists');
			}

			try {
				const realtimeResponse = await realtime.post('meetings/' + res.points[0].payload?.r + '/participants', {
					name: locals.user?.t || 'Anonymous',
					preset_name: 'group_call_participant',
					custom_participant_id: locals.user?.i
				});
				return text(realtimeResponse.data.data.token);
			} catch (err) {
				console.error('Failed to create realtime meeting:', err);
				throw error(500, 'Failed to create meeting');
			}
		} else {
			try {
				await set(locals.user.i, { f: 1 });
				const realtimeResponse = await realtime.post('meetings/' + (await get(locals.user?.i, 'r')) + '/participants', {
					name: locals.user?.t || 'Anonymous',
					preset_name: 'group_call_participant',
					custom_participant_id: locals.user?.i
				});
				return text(realtimeResponse.data.data.token);
			} catch (err) {
				console.error('Failed in else branch:', err);
				throw error(500, 'Failed to process request');
			}
		}
	} catch (err) {
		console.error('Top level error:', err);
		if (err.status) throw err;
		throw error(500, 'Internal server error');
	}
};
