import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { create } from '$lib/db';
import type { Preset } from '$lib/types';

export const POST: RequestHandler = async ({
	request,
	locals
}) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const { n, a, p, x } = (await request.json()) as {
		n: string;
		a?: string;
		p?: string;
		x?: string[];
	};
	if (!n?.trim()) throw error(400, 'missing name');
	const payload: Preset = {
		s: 'p',
		i: '',
		n: n.trim(),
		...(a?.trim() ? { a: a.trim() } : {}),
		...(p?.trim() ? { p: p.trim() } : {}),
		...(x?.length ? { x } : {}),
		d: Date.now()
	} as any;
	const i = await create(
		payload,
		[n, a, p].filter(Boolean).join(' ')
	);
	return json({ i });
};
