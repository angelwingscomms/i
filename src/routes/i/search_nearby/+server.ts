import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { embed } from '$lib/util/embed';
import { bbox, haversine_m, to_meters } from '$lib/util/geo';
import { search_by_payload, search_by_vector } from '$lib/db';

export const POST: RequestHandler = async ({ request }) => {
	const { lat, lon, radius, unit = 'meters', kind, limit = 50, q } = (await request.json()) as {
		lat: number;
		lon: number;
		radius: number;
		unit?: 'meters' | 'miles';
		kind?: number;
		limit?: number;
		q?: string;
	};
	if (
		typeof lat !== 'number' ||
		typeof lon !== 'number' ||
		typeof radius !== 'number' ||
		!isFinite(lat) ||
		!isFinite(lon) ||
		!isFinite(radius)
	) {
		throw error(400, 'invalid lat/lon/radius');
	}
	const radius_m = to_meters(radius, unit);
	const { minLat, maxLat, minLon, maxLon } = bbox(lat, lon, radius_m);
	const payload_filter: Record<string, unknown> = {
		s: 'i',
		l: { range: { gte: minLat, lte: maxLat } },
		n: { range: { gte: minLon, lte: maxLon } },
		...(kind !== undefined ? { kind } : {})
	};
	const cap = Math.min(Math.max(limit, 1), 200);
	let candidates: Array<{ i: string; t?: string; l?: number; n?: number; q?: string }> = [];
	if (q && q.trim()) {
		const vector = await embed(q);
		candidates = await search_by_vector({ vector, with_payload: ['t', 'l', 'n', 'q'], filter: { must: payload_filter }, limit: Math.min(500, cap * 10) });
	} else {
		candidates = await search_by_payload(payload_filter, ['t', 'l', 'n', 'q'], Math.min(500, cap * 10));
	}
	const within = candidates
		.map((it) => ({
			...it,
			dist: typeof it.l === 'number' && typeof it.n === 'number' ? haversine_m(lat, lon, it.l, it.n) : Number.MAX_VALUE
		}))
		.filter((it) => it.dist <= radius_m)
		.sort((a, b) => a.dist - b.dist)
		.slice(0, cap);
	return json(within);
};

