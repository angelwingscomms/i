import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { create, exists, get, search_by_payload, set } from '$lib/db';
import { s } from '$lib/util/s';
import { cf } from '$lib/util/cf';
import { v7 } from 'uuid';
import { PUBLIC_WORKER } from '$env/static/public';
import { chat_store_id } from '$lib/constants';

export const load: PageServerLoad = async ({ locals, params, platform }) => {
	if (!(await exists(params.i))) error(404, 'user not found');
	if (!locals.user) {
		redirect(302, '/google');
	}

	try {
		let c;
		const t = (await get(params.i, 't')) as string;
		console.log('--t', t);
		if (params.i === locals.user.i) {
			c = await get(locals.user.i, 'cs');
			if (!c) {
				c = await (await cf(platform)('http' + PUBLIC_WORKER + '/i' + (await s()))).text();
			}
			await set(locals.user.i, { cs: c });
			console.log('cs', c);
		} else {
			const id = [locals.user.i, params.i].sort().join('');
			console.log('id', id);
			c = await get(chat_store_id, id);
			console.log('c', c);
			if (!c) {
				c = await (await cf(platform)('http' + PUBLIC_WORKER + '/i' + (await s()))).text();
				console.log('got c', c);
				const set_data = {[id]: c}
				// set_data.id = c
				console.log('set_data', set_data)
				await set(chat_store_id, set_data);
				console.log('c again', await get(chat_store_id, id));
			}
		}

		return { s: await s(), c, t, m: await search_by_payload({ c, s: 'm' }) };
	} catch (err) {
		console.error('Error loading chat:', err);
		throw error(500, 'Failed to load chat');
	}
};
