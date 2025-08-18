import { create, get, search_by_payload } from '$lib/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { v7 } from 'uuid';
import { cf } from '$lib/util/cf';
import { PUBLIC_WORKER } from '$env/static/public';
import { s } from '$lib/util/s';

export const load: PageServerLoad = async ({ locals, cookies, params, platform }) => {
	let u = locals.user?.i
	if (!u) {
		u = v7();
		cookies.set('u', u, { path: '/' });
	}
	const chats = await search_by_payload({ s: 'r', u, r: params.i }, ['a']);
	console.log('ch', chats);
	if (!chats.length) {
		const c: string = await (
			await cf(platform)('http' + PUBLIC_WORKER + '/i' + (await s()))
		).text();

		const i = await create({ s: 'r', c, u, r: params.i, a: Date.now() }, '');
		redirect(302, `/r/${i}`);
	}
	return { c: chats, t: await get(params.i, 't') };
};
