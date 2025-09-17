import { get, qdrant } from './index';
import { create } from './index';
import { collection } from '$lib/constants';
import { embed } from '$lib/util/embed';
import type { Post } from '$lib/types';
import { summarize } from '$lib/ai/summarize';

export const create_post = async (
	user_id: string
): Promise<string> => {
	return create(
		{ s: 'p', u: user_id, d: Date.now() },
		''
	);
};

async function upsert_post(
	id: string,
	payload: Record<string, unknown>,
	embed_text?: string
) {
	let vector = new Array(3072).fill(0);
	if (embed_text) {
		vector = await embed(embed_text);
	}
	await qdrant.upsert(collection, {
		points: [{ id, payload, vector }],
		wait: true
	});
}

export const update_post = async (
	id: string,
	data: Partial<Post>
): Promise<Post> => {
	const existing = await get<Post>(id);
	if (!existing) {
		throw new Error('Post not found');
	}
	const base_data = { ...existing, ...data };
	const update_data =
		data.b && !base_data.y
			? { ...base_data, y: await summarize(data.b) }
			: base_data;
	const embed_text =
		update_data.m || update_data.y
			? `${update_data.m || ''} ${update_data.y || ''}`.trim()
			: '';
	await upsert_post(id, update_data, embed_text);
	return { ...update_data, i: id };
};
