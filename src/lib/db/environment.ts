import { create, get, qdrant } from './index';
import { collection } from '$lib/constants';
import { embed } from '$lib/util/embed';
import type { Environment } from '$lib/types';

const empty_vector = new Array(3072).fill(0);

export const create_environment = async (
	user_id: string,
	world_id: string,
	name: string,
	about: string,
	meta?: Record<string, unknown>
): Promise<string> => {
	const payload: Environment = {
		s: 'we',
		u: user_id,
		w: world_id,
		n: name,
		a: about,
		j: meta,
		d: Date.now()
	};
	const embed_source = [
		name,
		about,
		meta ? JSON.stringify(meta) : ''
	]
		.filter(Boolean)
		.join('\n');
	return create(payload, embed_source || undefined);
};

export const update_environment = async (
	id: string,
	data: Partial<Environment>
): Promise<void> => {
	const existing = await get<Environment>(id);
	if (!existing) {
		throw new Error('environment not found');
	}
	const updated: Environment = {
		...existing,
		...data,
		l: Date.now()
	};
	const embed_source = [
		updated.n,
		updated.a,
		updated.j ? JSON.stringify(updated.j) : ''
	]
		.filter(Boolean)
		.join('\n');
	const vector = embed_source
		? await embed(embed_source)
		: [...empty_vector];
	await qdrant.setPayload(collection, {
		points: [id],
		payload: updated as unknown as Record<string, unknown>,
		wait: true
	});
	await qdrant.updateVectors(collection, {
		points: [{ id, vector }]
	});
};
