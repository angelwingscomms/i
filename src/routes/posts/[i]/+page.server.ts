import { error } from '@sveltejs/kit';
import { search_by_payload, get, new_id } from '$lib/db';
import { realtime } from '$lib/util/realtime';
import type { Post } from '$lib/types';
import type { ChatMessage } from '$lib/types/index';

export const load = async ({ params, locals }) => {
	try {
		if (!params.i)
			throw error(400, 'Invalid post id');

		let post: Pick<
			Post,
			't' | 'b' | 'p' | 'u' | 'd' | 's' | 'r' | 'f'
		> | null;
		try {
			post = await get<Post>(params.i, [
				't',
				'b',
				'p',
				'u',
				'd',
				's',
				'r',
				'f'
			]);
			if (!post) throw error(404, 'Post not found');
			if (post.s !== 'p')
				throw error(404, 'This entity is not a post');
		} catch (e) {
			console.error('Error fetching post:', e);
			throw error(500, 'Failed to fetch post');
		}

		console.log('post', post);

			let pt: string | undefined;
			try {
				if ((post as any).f) {
					pt = (await get<string>((post as any).f as string, 't')) || undefined;
				}
			} catch (e) {
				console.error('Error fetching parent post title:', e);
			}


		let a: string;
		try {
			const realtime_res = await realtime.post(
				`meetings/${post.r}/participants`,
				{
					name: locals.user?.t || 'Anonymous',
					preset_name: 'group_call_participant',
					custom_participant_id:
						locals.user?.i || new_id()
				}
			);
			a = realtime_res.data.data.token;
		} catch (e) {
			console.error('Error with realtime:', await e.response?.data);
			throw error(
				500,
				'Failed to setup realtime communication'
			);
		}

		let messages, userMap;
		try {
			const messagePayloads = [
				'u',
				'm',
				'i',
				'd',
				'f'
			];
			messages = await search_by_payload(
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
			];

			const users = await Promise.all(
				userIds.map((id) =>
					get(id, 't').catch(() => ({
						i: id,
						t: 'Anonymous'
					}))
				)
			);

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

		return {
			p: { ...post, i: params.i },
			messages: chatMessages,
			t: post.t,
			pt: pt,
			_: '.',
			user: locals.user,
			a
		};
	} catch (e) {
		console.error('Unexpected error:', e);
		throw error(500, 'An unexpected error occurred');
	}
};
