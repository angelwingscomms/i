import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { embed } from '$lib/util/embed';
import { search_by_payload, search_by_vector } from '$lib/db';
import type { Preset } from '$lib/types';

export const POST: RequestHandler = async ({ request }) => {
	const body = (await request.json()) as { q?: string; l?: number };
	const q = (body?.q || '').trim();
	const limit = Math.min(Math.max(body?.l || 24, 1), 144);
	const payload_filter: Record<string, unknown> = { s: 'p' };

	if (q) {
		const vector = await embed(q);
		const results = await search_by_vector<Pick<Preset, 'n' | 'a' | 'p' | 'x'>>({
			vector,
			with_payload: ['n', 'a', 'p', 'x'],
			limit,
			filter: { must: payload_filter }
		});
		return json(results);
	}

	const results = await search_by_payload<Pick<Preset, 'n' | 'a' | 'p' | 'x'>>(
		payload_filter,
		['n', 'a', 'p', 'x'],
		limit
	);
	return json(results);
};
