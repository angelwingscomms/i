import type { PageServerLoad } from './$types';
import { search_by_payload } from '$lib/db';
import type { SyncProject } from '$lib/types';

type SyncListItem = SyncProject & { i: string };

export const load: PageServerLoad = async ({ locals }) => {
	let syncs: SyncListItem[] = [];

	try {
		syncs = await search_by_payload<SyncProject & { i: string }>(
		{ s: 'sync' },
			['u', 'n', 'd', 't', 'm', 'g'],
			54,
			{ key: 'd', direction: 'desc' } as any
		);
	} catch (error) {
		console.error('sync list load error', error);
	}

	return {
		u: locals.user,
		s: syncs
	};
};
