import { get, qdrant } from './index';
import { create } from './index';
import { collection } from '$lib/constants';
import { embed } from '$lib/util/embed';
import type { Zone } from '$lib/types';

export const create_zone = async (
	user_id: string
): Promise<string> => {
	return create(
		{
			s: 'z',
			u: user_id,
			d: Date.now(),
			n: '',
			l: 0,
			g: 0,
			C: []
		},
		''
	);
};

export const update_zone = async (
	id: string,
	data: Partial<Zone>
): Promise<void> => {
	const existing = await get<Zone>(id);
	if (!existing) {
		throw new Error('Zone not found');
	}
	let base_data = { ...existing, ...data };
	const update_data = base_data;
	const embed_text = JSON.stringify({
		name: update_data.n
	});
	let vector = new Array(3072).fill(0);
	if (embed_text) {
		vector = await embed(embed_text);
	}
	await qdrant.setPayload(collection, {
		points: [id],
		payload: update_data,
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
		return results.map((r) => r.payload as Zone);
	} else {
		const results = await qdrant.scroll(collection, {
			filter,
			limit,
			with_payload: true,
			with_vectors: false
		});
		return results.points.map(
			(p) => p.payload as Zone
		);
	}
};
