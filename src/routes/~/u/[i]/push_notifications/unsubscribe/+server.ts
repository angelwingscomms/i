import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { exists, get, set } from '$lib/db';
import type { User } from '$lib/types';

export const POST: RequestHandler = async ({
	params,
	request
}) => {
	const { i } = params;
	if (!i)
		return json(
			{ error: 'missing user id' },
			{ status: 400 }
		);
	if (!(await exists(i)))
		return new Response('user not found', {
			status: 404
		});

	// Optional body: { endpoint?: string } - if provided, remove only that endpoint
	let endpoint: string | undefined;
	try {
		const body = await request.json();
		endpoint = body?.endpoint;
	} catch (e) {
		console.error(
			'unsubscribe error, request.json()',
			e
		);
	}

	if (!endpoint) {
		await set(i, { ps: null });
		return json({ success: true, cleared: true });
	}

	const ps = await get<User['ps']>(i, 'ps');
	const list = Array.isArray(ps)
		? ps
		: ps
			? [ps as any]
			: [];
	const updated = list.filter(
		(s) => s && s.endpoint !== endpoint
	);
	await set(i, {
		ps: updated.length ? updated : null
	});
	return json({ success: true, removed: true });
};
