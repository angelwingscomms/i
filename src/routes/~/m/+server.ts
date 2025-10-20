import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import {
	search_by_payload,
	search_by_vector
} from '$lib/db';
import { embed } from '$lib/util/embed';
import type { Meme } from '$lib/types';

export const GET: RequestHandler = async () => {
	// Optional: list latest memes
	const items = await search_by_payload<Meme>(
		{ s: 'e' },
		['l', 'p', 'a', 'r'],
		60,
		{ key: 'd', direction: 'desc' } as any
	);
	return json(
		items.map((m) => ({
			i: (m as any).i,
			l: m.l,
			p: m.p,
			a: m.a,
			r: m.r
		}))
	);
};

export const PATCH: RequestHandler = async ({
	request
}) => {
	// Text search with embedding
	const { q } = (await request.json()) as {
		q: string;
	};
	const query = (q || '').trim();
	if (!query) return json([]);
	const v = await embed(query);
	const results = await search_by_vector<Meme>({
		vector: v,
		with_payload: ['l', 'p', 'a', 'r'],
		limit: 72,
		filter: { must: { s: 'e' } as any }
	});
	return json(
		results.map((m) => ({
			i: (m as any).i,
			l: m.l,
			p: m.p,
			a: m.a,
			r: m.r
		}))
	);
};

// /m/search
export const POST: RequestHandler = async ({
	request
}) => {
	const { q } = (await request.json()) as {
		q?: string;
	};
	if (!q) {
		const items = await search_by_payload<Meme>(
			{ s: 'e' },
			['l', 'p', 'a', 'r'],
			60,
			{ key: 'd', direction: 'desc' } as any
		);
		return json(
			items.map((m) => ({
				i: (m as any).i,
				l: m.l,
				p: m.p,
				a: m.a,
				r: m.r
			}))
		);
	}
	const v = await embed(q);
	const items = await search_by_vector<Meme>({
		vector: v,
		with_payload: ['l', 'p', 'a', 'r'],
		limit: 72,
		filter: { must: { s: 'e' } as any }
	});
	return json(
		items.map((m) => ({
			i: (m as any).i,
			l: m.l,
			p: m.p,
			a: m.a,
			r: m.r
		}))
	);
};

// /m/n upload endpoint: lives in /m/n/+server.ts (separate file)
