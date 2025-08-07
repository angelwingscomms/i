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
		} else {
			c = u.c[locals.user.i] || ((await get(locals.user.i, 'c.' + params.i)) as string);
			if (!c) {
				c = await (await cf(platform)('http' + PUBLIC_WORKER + '/i' + (await s()))).text();
				await set(params.i, { ['c.' + locals.user.i]: c });
				await set(locals.user.i, { ['c.' + params.i]: c });
			}
		}

		return { s: await s(), c, t: u.t, m: search_by_payload({ c }) };
	} catch (err) {
		console.error('Error loading chat:', err);
		throw error(500, 'Failed to load chat');
	}
};
