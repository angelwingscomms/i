import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { create } from '$lib/db';
import { embed } from '$lib/util/embed';
import type { Item } from '$lib/types/item';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const { t, d, k } = (await request.json()) as { t: string; d: string; k?: 0 | 1 };
	if (!t || !d) throw error(400, 'missing fields');
	const q = d ? (await embed(d)).slice(0, 0) && d.substring(0, 160) : undefined; // minimal summary placeholder
	const payload: Item = { s: 'i', t: t.trim(), q, k: k ?? 0 };
	const i = await create(payload, d);
	return json({ i });
};

