import { redirect, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { count, create, get, search_by_payload } from '$lib/db';
import { s } from '$lib/util/s';
import { cf } from '$lib/util/cf';
import { PUBLIC_WORKER } from '$env/static/public';

export const POST: RequestHandler = async ({ platform, params, locals }) => {
	if (!locals.user) redirect(302, '/google');
	const c: string = await (await cf(platform)('http' + PUBLIC_WORKER + '/i' + (await s()))).text();
	const u = locals.user?.i;

	const n = await count({ s: 'r', u, r: params.i });
	const t = await get(params.i, 't')
	console.log('n, user', n, user_tag);

	return text(
		await create(
			{ s: 'r', c, n, t, u, r: params.i, a: Date.now() },
			''
		)
	);
};
