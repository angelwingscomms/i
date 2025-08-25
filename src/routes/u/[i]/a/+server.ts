import { redirect, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { count, create, get, search_by_payload } from '$lib/db';
import { s } from '$lib/util/s';
import { cf } from '$lib/util/cf';
import { PUBLIC_WORKER } from '$env/static/public';

export const POST: RequestHandler = async ({ platform, params, locals }) => {
	try {
		if (!locals.user) redirect(302, '/google');
		const c: string = await (
			await cf(platform)('http' + PUBLIC_WORKER + '/i' + (await s()))
		).text();
		const u = locals.user?.i;

		const n = await count({ s: 'r', u, r: params.i });
		const t = await get(params.i, 't');
		console.log('Creating chat - n:', n, 'user:', t);

		const chatId = await create({ s: 'r', c, n, t, u, r: params.i, a: Date.now() }, '');

		console.log('Chat created successfully:', chatId);
		return text(chatId);
	} catch (error) {
		console.error('Error creating anonymous chat:', error);
		throw error;
	}
};
