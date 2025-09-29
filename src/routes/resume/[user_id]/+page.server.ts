import { error } from '@sveltejs/kit';
import { search_by_payload } from '$lib/db';
import type { PageServerLoad } from './$types';
import type { Resume } from '$lib/types';

export const load: PageServerLoad = async ({
	locals,
	params
}) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}
	const resumes = await search_by_payload<
		Pick<Resume, 'i' | 'd' | 'l' | 'h'>
	>({ s: 'e', u: params.user_id }, true, 100);
	return {
		e: resumes,
		user: locals.user,
		target_user: params.user_id
	};
};
