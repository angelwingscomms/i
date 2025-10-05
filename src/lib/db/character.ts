import { create, get, qdrant } from './index';
import { collection } from '$lib/constants';
import { embed } from '$lib/util/embed';
import type { Character } from '$lib/types';

const empty_vector = new Array(3072).fill(0);

export const create_character = async (
	user_id: string,
	world_id: string,
	name: string,
	about: string,
	meta?: Record<string, unknown>
): Promise<string> => {
	const payload: Character = {
		s: 'wc',
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

export const update_character = async (
	id: string,
	data: Partial<Character>
): Promise<void> => {
	const existing = await get<Character>(id);
	if (!existing) {
		throw new Error('character not found');
	}
	const updated: Character = {
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
