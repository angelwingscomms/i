import type { Item } from '$lib/types/item';
import { fetch_items } from '../fetch_items';
import type { ItemSort } from '../types';

export type ItemSearchState = {
	q: string;
	k?: 0 | 1;
	s: ItemSort;
};

type ControllerConfig = {
	get_query: () => string;
	set_query: (value: string) => void;
	get_kind: () => 0 | 1 | undefined;
	set_kind: (value: 0 | 1 | undefined) => void;
	get_sort: () => ItemSort;
	set_sort: (value: ItemSort) => void;
	get_timeout: () => NodeJS.Timeout | null;
	set_timeout: (timeout: NodeJS.Timeout | null) => void;
	onsearch?: () => void | Promise<void>;
	wait?: number;
};

const STORAGE_KEY = 'item_search_query';
const DEFAULT_WAIT = 2160;

export function persist_item_search_state(
	storage: Pick<Storage, 'setItem'>,
	state: ItemSearchState
): void {
	storage.setItem(
		STORAGE_KEY,
		JSON.stringify({ q: state.q, k: state.k, s: state.s })
	);
}

export function restore_item_search_state(
	storage: Pick<Storage, 'getItem'>
): ItemSearchState | null {
	const raw = storage.getItem(STORAGE_KEY);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as Partial<ItemSearchState>;
		return {
			q: typeof parsed.q === 'string' ? parsed.q : '',
			k: parsed.k === 0 || parsed.k === 1 ? parsed.k : undefined,
			s:
				parsed.s === 'newest' || parsed.s === 'oldest'
					? parsed.s
					: 'relevance'
		};
	} catch (error) {
		console.error('restore_item_search_state error', error);
		return null;
	}
}

export function parse_item_kind(value: string): 0 | 1 | undefined {
	if (value === '0') return 0;
	if (value === '1') return 1;
	return undefined;
}

export function parse_item_sort(value: string): ItemSort {
	return value === 'newest' || value === 'oldest'
		? value
		: 'relevance';
}

export function create_item_search_controller(
	config: ControllerConfig
) {
	const wait = config.wait ?? DEFAULT_WAIT;

	const schedule = () => {
		const current = config.get_timeout();
		if (current) clearTimeout(current);
		const timeout = setTimeout(() => {
			config.onsearch?.();
		}, wait);
		config.set_timeout(timeout);
	};

	const clear_search = () => {
		config.set_query('');
		const current = config.get_timeout();
		if (current) clearTimeout(current);
		config.set_timeout(null);
	};

	const handle_search = () => {
		schedule();
	};

	const handle_kind_change = (value: string) => {
		config.set_kind(parse_item_kind(value));
		schedule();
	};

	const handle_sort_change = (value: string) => {
		config.set_sort(parse_item_sort(value));
		schedule();
	};

	const trigger_search = () => {
		const current = config.get_timeout();
		if (current) clearTimeout(current);
		config.set_timeout(null);
		config.onsearch?.();
	};

	return {
		clear_search,
		handle_search,
		handle_kind_change,
		handle_sort_change,
		trigger_search
	};
}

type ExecutorConfig = {
	get_query: () => string;
	get_kind: () => 0 | 1 | undefined;
	get_sort: () => ItemSort;
	set_results: (items: (Item & { score?: number })[]) => void;
	set_searching: (value: boolean) => void;
};

export function create_item_search_executor(
	config: ExecutorConfig
) {
	return async () => {
		config.set_searching(true);
		try {
			const items = await fetch_items({
				q: config.get_query().trim() || undefined,
				k: config.get_kind(),
				s: config.get_sort(),
				limit: 50
			});
			config.set_results(items);
		} catch (error) {
			console.error('item search error', error);
			config.set_results([]);
		} finally {
			config.set_searching(false);
		}
	};
}
