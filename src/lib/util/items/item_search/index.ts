import type { ItemSort } from '../types';

export type ItemSearchState = {
	q: string;
	k?: 0 | 1;
	s: ItemSort;
};

const STORAGE_KEY = 'item_search_query';

export function persist_item_search_state(
	storage: Pick<Storage, 'setItem'>,
	state: ItemSearchState
): void {
	storage.setItem(
		STORAGE_KEY,
		JSON.stringify({
			q: state.q,
			k: state.k,
			s: state.s
		})
	);
}

export function restore_item_search_state(
	storage: Pick<Storage, 'getItem'>
): ItemSearchState | null {
	const raw = storage.getItem(STORAGE_KEY);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(
			raw
		) as Partial<ItemSearchState>;
		return {
			q: typeof parsed.q === 'string' ? parsed.q : '',
			k:
				parsed.k === 0 || parsed.k === 1
					? parsed.k
					: undefined,
			s: (['relevance', 'newest', 'oldest', 'name', 'price'] as const).includes(parsed.s as any) ? parsed.s as ItemSort : 'relevance'
		};
	} catch (error) {
		console.error(
			'restore_item_search_state error',
			error
		);
		return null;
	}
}

export function parse_item_kind(
	value: string
): 0 | 1 | undefined {
	if (value === '0') return 0;
	if (value === '1') return 1;
	return undefined;
}

export function parse_item_sort(
	value: string
): ItemSort {
	if (['relevance', 'newest', 'oldest', 'name', 'price'].includes(value)) {
		return value as ItemSort;
	}
	return 'relevance';
}
