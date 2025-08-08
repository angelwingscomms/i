import { redirect, error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { exists, get, search_by_payload, set } from '$lib/db';
import { s } from '$lib/util/s';
import { cf } from '$lib/util/cf';
import { PUBLIC_WORKER } from '$env/static/public';

export const load: PageServerLoad = async ({ locals, params, platform }) => {
	if (!(await exists(params.i))) error(404, 'user not found');
	if (!locals.user) {
		redirect(302, '/google');
	}

	try {
		let c;
		const u = (await get(params.i, ['c.' + locals.user.i, 't'])) as {
			t: string;
			c: Record<string, string>;
		};
		console.log('--u', u);
		if (params.i === locals.user.i) {
			c = await get(locals.user.i, 'cs');
			if (!c) {
				c = await (await cf(platform)('http' + PUBLIC_WORKER + '/i' + (await s()))).text();
			}
			await set(locals.user.i, { cs: c });
			console.log('cs', c);
		} else {
			const sort = [locals.user.i, params.i].sort();
			c = await get(sort[0], 'c.' + sort[0] + sort[1]);
			if (!c) {
				c = await (await cf(platform)('http' + PUBLIC_WORKER + '/i' + (await s()))).text();
				console.log('c', c);
				await set(sort[0], { ['c.' + sort[0] + sort[1]]: c });
			}
		}

		return { s: await s(), c, t: u.t, m: await search_by_payload({ c, s: 'm' }) };
	} catch (err) {
		console.error('Error loading chat:', err);
		throw error(500, 'Failed to load chat');
	}
};
