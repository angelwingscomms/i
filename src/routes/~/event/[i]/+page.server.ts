import { error } from '@sveltejs/kit';
import {
	search_by_payload,
	get,
	new_id,
	count,
	qdrant
} from '$lib/db';
import { collection } from '$lib/constants';
// import { realtime } from '$lib/util/realtime';
import type {
	Event,
	User,
	Message
} from '$lib/types';
import type { ChatMessage } from '$lib/types/index';
import { embed } from '$lib/util/embed';

import { cosine_similarity } from '$lib/util/vector/cosine_similarity';

export const load = async ({ params, locals }) => {
	try {
		if (!params.i)
			throw error(400, 'Invalid event id');

		// Get current user's events to check if joined
		let j = 0;
		if (locals.user) {
			const user = await get(locals.user.i, ['ev']);
			const user_events = user?.ev || [];
			j = user_events.includes(params.i) ? 1 : 0;
		}

		let event: Pick<
			Event,
			| 't'
			| 'b'
			| 'p'
			| 'u'
			| 'd'
			| 's'
			| 'r'
			| 'f'
			| 'c'
		> | null;
		try {
			event = await get<Event>(params.i, [
				't',
				'b',
				'p',
				'u',
				'd',
				's',
				'r',
				'f',
				'c'
			]);
			if (!event) throw error(404, 'Event not found');
			if (event.s !== 'ev')
				throw error(
					404,
					'This entity is not an event'
				);
		} catch (e) {
			console.error('Error fetching event:', e);
			throw error(500, 'Failed to fetch event');
		}

		let children: Event[] = [];
		if (event.c === '.') {
			try {
				children = await search_by_payload(
					{ s: 'ev', f: params.i },
					['i', 't', 'b', 'p', 'u', 'd'],
					undefined,
					{ d: 'asc' }
				);
			} catch (e) {
				console.error(
					'Error fetching child events:',
					e
				);
			}
		}

		console.log('event', event);

		let author = {
			i: event.u,
			t: 'Anonymous',
			av: undefined
		};
		if (event.u) {
			try {
				const authorData = await get<
					Pick<User, 't' | 'av'>
				>(event.u, ['t', 'av']);
				if (authorData) {
					const data = authorData as Pick<
						User,
						't' | 'av'
					>;
					author = {
						i: event.u,
						t: data.t || 'Anonymous',
						av: data.av
					};
				}
			} catch (e) {
				console.error('Error fetching author:', e);
			}
		}

		let pt: string | undefined;
		try {
			if (event.f) {
				pt =
					(await get<string>(
						event.f as string,
						't'
					)) || undefined;
			}
		} catch (e) {
			console.error(
				'Error fetching parent event title:',
				e
			);
		}

		// let a: string;
		// try {
		// 	const realtime_res = await realtime.post(
		// 		`meetings/${event.r}/participants`,
		// 		{
		// 			name: locals.user?.t || 'Anonymous',
		// 			preset_name: 'group_call_participant',
		// 			custom_participant_id:
		// 				locals.user?.i || new_id()
		// 		}
		// 	);
		// 	a = realtime_res.data.data.token;
		// } catch (e) {
		// 	console.error(
		// 		'Error with realtime:',
		// 		await (e as { response?: { data?: unknown } })
		// 			.response?.data
		// 	);
		// 	throw error(
		// 		500,
		// 		'Failed to setup realtime communication'
		// 	);
		// }

		let messages: Message[],
			userMap: Record<string, string>;
		try {
			const messagePayloads = [
				'u',
				'm',
				'i',
				'd',
				'f'
			];
			messages = await search_by_payload<Message>(
				{ s: 'm', r: params.i },
				messagePayloads,
				undefined,
				{ d: 'desc' }
			);

			const messagesChron = messages.reverse();
			const userIds = [
				...new Set(
					messagesChron
						.map((m) => m.u)
						.filter(Boolean)
				)
			] as string[];

			const users = (await Promise.all(
				userIds.map((id) =>
					get(id, 't').catch(() => ({
						i: id,
						t: 'Anonymous'
					}))
				)
			)) as Array<{ i: string; t: string }>;

			userMap = Object.fromEntries(
				users.map((u) => [u.i, u.t])
			);
		} catch (e) {
			console.error('Error fetching messages:', e);
			messages = [];
			userMap = {};
		}

		const chatMessages: ChatMessage[] = messages.map(
			(msg) => ({
				i: msg.i,
				m: msg.m,
				x: msg.u
					? userMap[msg.u] || 'Anonymous'
					: 'Anonymous',
				u: msg.u,
				d: msg.d,
				f: msg.f
			})
		);

		// Get total user count in this event
		let total_user_count = 0;
		try {
			total_user_count = await count({
				s: 'u',
				ev: params.i
			});
		} catch (e) {
			console.error(
				'Error counting users in event:',
				e
			);
		}

		// Get user description state and similar users
		let user_has_description = false;
		let users: (User & {
			similarity_percentage?: number;
		})[] = [];
		let show_all_users = false;
		if (locals.user) {
			try {
				const user_desc = await get<string>(
					locals.user.i,
					'd'
				);
				user_has_description = !!user_desc;
				console.log('user_desc', user_desc);
				if (user_desc) {
					// Get current user's vector for similarity calculation
					const current_user_data = await get<{
						vector: number[];
					}>(locals.user.i, ['vector'], true);

					// Find users who joined this event
					const queryResults = await qdrant.query(
						collection,
						{
							query: await embed(user_desc),
							filter: {
								must: [
									{ key: 's', match: { value: 'u' } },
									{
										key: 'ev',
										match: { value: params.i }
									}
								],
								must_not: [
									{ has_id: [locals.user.i] }
								]
							},
							limit: 9, 
							with_payload: [
								't',
								'av',
								'a',
								'g',
								'd'
							],
							with_vector: true
						}
					);

					const searchResults = queryResults.map(
						(point) => {
							const result: any = {
								...(point.payload as any),
								i: point.id,
								score: point.score
							};
							if (point.vector)
								result.vector = point.vector;
							return result;
						}
					);

					// Get similarity for each user
					users = await Promise.all(
						searchResults.map(async (result) => {
							let similarity_percentage = 0;
							if (
								current_user_data?.vector &&
								result.vector
							) {
								const similarity = cosine_similarity(
									current_user_data.vector,
									result.vector
								);
								// Convert to percentage (0-100%) and clamp between 0-100
								similarity_percentage = Math.max(
									0,
									Math.min(
										100,
										Math.round(similarity * 100)
									)
								);
							}

							return {
								...result,
								similarity_percentage
							};
						})
					);

					// If no similar users found, show all users in the event
					if (users.length === 0) {
						show_all_users = true;
						const allUsers = await search_by_payload(
							{ s: 'u', ev: params.i },
							['t', 'av', 'a', 'g', 'd'],
							undefined,
							{ limit: 20 }
						);
						users = allUsers.filter(
							(u) => u.i !== locals.user.i
						);
					}
				}
			} catch (e) {
				console.error(
					'Error finding similar users in event:',
					e
				);
			}
		}

		console.log('users', users);

		return {
			p: { ...event, i: params.i },
			children,
			messages: chatMessages,
			t: event.t,
			pt,
			_: '.',
			// a,
			author,
			j,
			users,
			total_user_count,
			user_has_description,
			show_all_users
		};
	} catch (e) {
		console.error('Unexpected error:', e);
		throw error(500, 'An unexpected error occurred');
	}
};
