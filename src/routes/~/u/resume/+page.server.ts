import { error } from '@sveltejs/kit';
import { search_by_payload } from '$lib/db';
import type { PageServerLoad } from './$types';
import type { Resume } from '$lib/types';

export const load: PageServerLoad = async ({
	url,
	locals
}) => {
	const userId = url.searchParams.get('user');
	if (!userId) {
		throw error(400, 'User parameter required');
	}

	const resumes = await search_by_payload<
		Pick<Resume, 'i' | 'd' | 'l' | 'h'>
	>({ s: 'e', u: userId }, true, 100);

	return {
		e: resumes,
		user: locals.user,
		targetUserId: userId
	};
};
