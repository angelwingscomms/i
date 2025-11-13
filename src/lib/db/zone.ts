import {
	create,
	get,
	getfirst,
	qdrant
} from './index';
import { collection } from '$lib/constants';
import { embed } from '$lib/util/embed';
import type { Zone } from '$lib/types/zone';

export const create_zone = async (
	user_id: string,
	data?: Partial<Zone>,
	place_id?: string
): Promise<string> => {
	const payload: Zone = {
		s: 'z',
		u: user_id,
		d: Date.now(),
		n: data?.n ?? '',
		l: data?.l ?? 0,
		g: data?.g ?? 0,
		c: data?.c ?? [],
		p: data?.p ?? place_id
	};
	const embed_source = payload.n?.trim()
		? payload.n
		: undefined;
	return create(payload, embed_source, place_id);
};

export const find_zone_by_place = async (
	place_id: string
): Promise<Zone | null> => {
	if (!place_id) return null;
	return await getfirst<Zone>({
		s: 'z',
		p: place_id
	});
};

export const update_zone = async (
	id: string,
	data: Partial<Zone>
): Promise<void> => {
	const existing = await get<Zone>(id);
	if (!existing) {
		throw new Error('Zone not found');
	}
	const base_data: Zone = {
		...existing,
		...data,
		c: data.c ?? existing.c ?? []
	};
	const update_data = base_data;
	const embed_text = update_data.n?.trim()
		? update_data.n
		: '';
	let vector = new Array(3072).fill(0);
	if (embed_text) {
		vector = await embed(embed_text);
	}
	await qdrant.setPayload(collection, {
		points: [id],
		payload: update_data as unknown as Record<
			string,
			unknown
		>,
		wait: true
	});
	await qdrant.updateVectors(collection, {
		points: [{ id, vector }]
	});
};

export const get_zone = async (
	id: string
): Promise<Zone | null> => {
	return await get<Zone>(id);
};

export const search_zones = async (
	q?: string,
	limit = 20
): Promise<Zone[]> => {
	const filter = {
		must: [
			{
				key: 's',
				match: {
					value: 'z'
				}
			}
		]
	};
	if (q) {
		const query_vector = await embed(q);
		const results = await qdrant.search(collection, {
			vector: query_vector,
			limit,
			filter,
			with_payload: true
		});
		return results.map((r) => ({
			...(r.payload as unknown as Zone),
			i: r.id as string
		}));
	} else {
		const results = await qdrant.scroll(collection, {
			filter,
			limit,
			with_payload: true,
			with_vector: false
		});
		return results.points.map((p) => ({
			...(p.payload as unknown as Zone),
			i: p.id as string
		}));
	}
};
