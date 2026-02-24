import axios from 'axios';
import type { Item } from '$lib/types/item';
import type { ItemSort } from '../types';

export type ItemFetchPayload = {
	q?: string;
	k?: 0 | 1;
	s?: ItemSort;
	l?: number;
	u?: string;
};

export async function fetch_items(
	payload: ItemFetchPayload
): Promise<Item[]> {
	const response = await axios.post('/~/items', {
		q: payload.q,
		k: payload.k,
		s: payload.s,
		l: payload.l,
		u: payload.u
	});
	return response.data as Item[];
}
