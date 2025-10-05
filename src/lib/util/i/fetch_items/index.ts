import axios from 'axios';
import type { Item } from '$lib/types/item';
import type { ItemSort } from '../types';

export type ItemFetchPayload = {
	q?: string;
	k?: 0 | 1;
	s?: ItemSort;
	limit?: number;
};

export async function fetch_items(
	payload: ItemFetchPayload
): Promise<Item[]> {
	const response = await axios.post('/i', payload);
	return response.data as Item[];
}
