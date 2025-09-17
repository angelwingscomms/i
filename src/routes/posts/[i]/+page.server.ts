import { error } from '@sveltejs/kit';
import { search_by_payload, get } from '$lib/db';
import type { Post } from '$lib/types';
import type { ChatMessage } from '$lib/types/index';

export const load = async ({ params, locals }) => {
	if (!params.i) throw error(400, 'Invalid post id');
	const post: Pick<
		Post,
		't' | 'b' | 'p' | 'u' | 'd' | 's'
	> | null = await get<Post>(params.i, [
		't',
		'b',
		'p',
		'u',
		'd',
		's'
	]);
	if (!post)
		throw error(404, 'Post not found');
	if (post.s !== 'p') {
		throw error(404, 'This entity is not a post');
	}
	console.log('post', post);

	const messagePayloads = ['u', 'm', 'i', 'd', 'f'];
	const messages = await search_by_payload({ s: 'm', r: params.i }, messagePayloads, undefined, { d: 'desc' });

	const messagesChron = messages.reverse();

	const userIds = [...new Set(messagesChron.map(m => m.u).filter(Boolean))];

	const users = await Promise.all(userIds.map(id => get(id, 't')));

	const userMap = Object.fromEntries(users.map(u => [u.i, u.t]));

	const chatMessages: ChatMessage[] = messagesChron.map(msg => ({
		i: msg.i,
		m: msg.m,
		x: msg.u ? userMap[msg.u] || 'Anonymous' : 'Anonymous',
		u: msg.u,
		d: msg.d,
		f: msg.f
	}));

	return { 
		p: { ...post, i: params.i }, 
		messages: chatMessages, 
		t: post.t, 
		_: '.', 
		user: locals.user 
	};
};
