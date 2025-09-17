import { error } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { PageServerLoad } from './$types';
import type { Resume } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	const r = await get<Pick<Resume, 'u' | 'h' | 'd' | 'l'>>(params.i, ['u', 'h', 'd', 'l']);
	if (!r) {
		throw error(404, 'Resume not found');
	}
	return { r: { ...r, i: params.i } };
};