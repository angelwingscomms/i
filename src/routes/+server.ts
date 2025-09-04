import { collection } from '$lib/constants';
import { get, qdrant, set } from '$lib/db';
import { realtime } from '$lib/util/realtime';
import { error, text } from '@sveltejs/kit';
import { v7 } from 'uuid';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals, request, url }) => {
	console.log('🔥 GET request started', {
		locals,
		request: { url: request.url, headers: Object.fromEntries(request.headers) }
	});
	try {
		console.log('👤 Checking user authentication');
		if (!locals.user) {
			console.error('❌ No user in locals:', locals);
			error(401, 'Unauthorized');
		}
		console.log('✅ User authenticated:', locals.user);

		let res;
		try {
			console.log('🎯 Attempting to get user vector for:', locals.user.i);
			let userVector;
			try {
				console.log('📊 Fetching user vector from database');
				const userData = await get<{ vector: number[] }>(locals.user.i, false, true);
				console.log('📊 User data received:', {
					userId: locals.user.i,
					hasVector: !!userData?.vector
				});
				userVector = userData?.vector;
			} catch (err) {
				console.error('💥 CRITICAL: User vector fetch failed:', err);
				console.log('⚠️ Using fallback zero vector');
				userVector = new Array(3072).fill(0);
			}

			console.log('🔍 Querying Qdrant with params:', {
				collection,
				userId: locals.user.i,
				vectorLength: userVector?.length
			});

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

			res = await qdrant.query(collection, {
				filter: {
					must_not: { has_id: [locals.user.i] },
					must
				},
				query: userVector,
				with_payload: ['r'],
				limit: 1
			});
			console.log('✨ Qdrant query results:', JSON.stringify(res, null, 2));
		} catch (err) {
			console.error('💥 FATAL: Qdrant query failed:', err);
			console.error('Stack trace:', err.stack);
			throw error(500, 'Failed to query database');
		}

		console.log('🔄 Processing query results:', {
			hasPoints: !!res.points.length,
			firstPoint: res.points[0]
		});
		if (res.points.length && res.points[0].payload?.r) {
			console.log('🤝 Match found! Processing match data');
			try {
				console.log('📝 Setting initial f values');
				await Promise.all([
					set(res.points[0].id as string, { f: '' }),
					set(locals.user.i, { f: '' })
				]);
				console.log('✅ Initial f values set successfully');
			} catch (err) {
				console.error('💥 Failed to set f values:', err);
				console.error('Detailed error:', JSON.stringify(err, null, 2));
				throw error(500, 'Failed to update user status');
			}

			let other_user, self;
			try {
				console.log('👥 Fetching both users data');
				[other_user, self] = await Promise.all([
					get<{ a: number; g: number; vector: number[] }>(
						res.points[0].id as string,
						['a', 'g'],
						true
					),
					get<{ a: number; g: number; vector: number[] }>(locals.user.i, ['a', 'g'], true)
				]);
				console.log('📊 Users data retrieved:', {
					other_user: { ...other_user, vector: 'VECTOR_HIDDEN' },
					self: { ...self, vector: 'VECTOR_HIDDEN' }
				});
			} catch (err) {
				console.error('💥 Failed to get users data:', err);
				console.error('Stack:', err.stack);
				throw error(500, 'Failed to fetch user data');
			}

			try {
				console.log('💾 Upserting match data to Qdrant');
				const point1Id = v7();
				const point2Id = v7();
				console.log('Generated UUIDs:', { point1Id, point2Id });

				await qdrant.upsert(collection, {
					points: [
						{
							id: point1Id,
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
							id: point2Id,
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
				console.log('✅ Match data upserted successfully');
			} catch (err) {
				console.error('💥 CRITICAL: Failed to upsert match data:', err);
				console.error('Full error object:', JSON.stringify(err, null, 2));
				throw error(500, 'Failed to save match data');
			}

			let self_friends, other_friends;
			try {
				console.log('👥 Fetching friends lists');
				[self_friends, other_friends] = await Promise.all([
					get<{ f: string[] }>(locals.user.i, ['f']),
					get<{ f: string[] }>(res.points[0].id as string, ['f'])
				]);
				console.log('Current friends lists:', { self_friends, other_friends });
			} catch (err) {
				console.error('💥 Failed to get friends lists:', err);
				console.error('Error details:', err.stack);
				throw error(500, 'Failed to fetch friends data');
			}

			const updated_self_friends = [...(self_friends?.f || []), res.points[0].id];
			const updated_other_friends = [...(other_friends?.f || []), locals.user.i];
			console.log('📝 Updated friends lists:', { updated_self_friends, updated_other_friends });

			try {
				console.log('💾 Updating friends lists in database');
				await Promise.all([
					set(locals.user.i, { f: updated_self_friends }),
					set(res.points[0].id as string, { f: updated_other_friends })
				]);
				console.log('✅ Friends lists updated successfully');
			} catch (err) {
				console.error('💥 Failed to update friends lists:', err);
				console.error('Full error:', JSON.stringify(err, null, 2));
				throw error(500, 'Failed to update friends lists');
			}

			try {
				console.log('🎥 Creating realtime meeting');
				const meetingEndpoint = 'meetings/' + res.points[0].payload?.r + '/participants';
				console.log('Meeting endpoint:', meetingEndpoint);

				const realtimeResponse = await realtime.post(meetingEndpoint, {
					name: locals.user?.t || 'Anonymous',
					preset_name: 'group_call_participant',
					custom_participant_id: locals.user?.i
				});
				console.log('✅ Realtime meeting created:', realtimeResponse.data);
				return text(realtimeResponse.data.data.token);
			} catch (err) {
				console.error('💥 CRITICAL: Failed to create realtime meeting:', err);
				console.error('Request details:', err.request);
				console.error('Response details:', err.response);
				throw error(500, 'Failed to create meeting');
			}
		} else {
			console.log('🤷 No match found, processing solo user');
			try {
				console.log('📝 Setting user f status to 1');
				await set(locals.user.i, { f: 1 });

				let userRoom = await get(locals.user?.i, 'r');
				console.log('User room:', typeof userRoom, userRoom);
				if (!userRoom || typeof userRoom !== 'string') {
					console.log('🏠 Creating new room for user');
					const newRoom = (await realtime.post('meetings', { title: locals.user.t })).data.data.id;
					await set(locals.user.i, { r: newRoom });
					console.log('✅ Room created:', newRoom);
					userRoom = newRoom;
				}

				console.log('🎥 Creating solo realtime meeting');
				let realtimeResponse;
				try {
					realtimeResponse = await realtime.post('meetings/' + userRoom + '/participants', {
						name: locals.user?.t || 'Anonymous',
						preset_name: 'group_call_participant',
						custom_participant_id: locals.user?.i
					});
				} catch (err) {
					console.error('💥 Failed to create solo realtime meeting:', err);
					throw error(500, 'Failed to create solo meeting');
				}
				console.log('✅ Solo meeting created:', realtimeResponse.data);
				return text(realtimeResponse.data.data.token);
			} catch (err) {
				console.error('💥 Failed in else branch:', err);
				console.error('Full error details:', {
					message: err.message,
					stack: err.stack,
					response: err.response?.data,
					request: err.request
				});
				throw error(500, 'Failed to process request');
			}
		}
	} catch (err) {
		console.error('💥 TOP LEVEL ERROR:', err);
		console.error('Error type:', err.constructor.name);
		console.error('Stack trace:', err.stack);
		console.error('Full error object:', JSON.stringify(err, null, 2));
		if (err.status) throw err;
		throw error(500, 'Internal server error');
	}
};
