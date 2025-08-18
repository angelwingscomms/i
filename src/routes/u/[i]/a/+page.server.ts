import { create, search_by_payload } from '$lib/db';
import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { v7 } from 'uuid';

export const load: PageServerLoad = async ({ locals, cookies, params }) => {
	let u = locals.user?.u || cookies.get('u');
	if (!u) {
		u = v7();
		cookies.set('u', u, { path: '/' });
	}
	const chats = await search_by_payload({ s: 'r', u, r: params.i }, ['a']);
	if (!chats.length) {
		const i = create({ s: 'r', u, r: params.i, a: Date.now() }, '');
		redirect(302, `/r/${i}`);
	}
	return { c: chats };
};
