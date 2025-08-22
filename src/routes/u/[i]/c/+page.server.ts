import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { exists, get, search_by_payload, set } from '$lib/db';
import { s } from '$lib/util/s';
import { cf } from '$lib/util/cf';
import { PUBLIC_WORKER } from '$env/static/public';
import { chat_store_id } from '$lib/constants';

export const load: PageServerLoad = async ({ locals, params, platform }) => {
	if (!(await exists(params.i))) error(404, 'user not found');
	if (!locals.user) {
		redirect(302, `/google?next=/u/${params.i}/c`);
	}

	try {
		let c;
		const t = (await get(params.i, 't')) as string;
		if (params.i === locals.user.i) {
			c = await get(locals.user.i, 'cs');
			if (!c) {
				c = await (await cf(platform)('http' + PUBLIC_WORKER + '/i' + (await s()))).text();
			}
			await set(locals.user.i, { cs: c });
		} else {
			const id = [locals.user.i, params.i].sort().join('');
			c = await get(chat_store_id, id);
			if (!c) {
				c = await (await cf(platform)('http' + PUBLIC_WORKER + '/i' + (await s()))).text();
				await set(chat_store_id, { [id]: c });
			}
		}

		return { s: await s(), c, t, m: await search_by_payload({ c, s: 'm' }, undefined, undefined, { key: 'd', direction: 'asc' }) };
	} catch (err) {
		console.error('Error loading chat:', err);
		throw error(500, 'Failed to load chat');
	}
};
