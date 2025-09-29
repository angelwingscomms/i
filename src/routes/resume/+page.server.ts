import { error, redirect } from '@sveltejs/kit';
import { search_by_payload } from '$lib/db';
import type { PageServerLoad } from './mine/$types';
import type { Resume } from '$lib/types';

export const load: PageServerLoad = async ({
	locals
}) => {
	if (!locals.user) {
		redirect(302, '/google?next=/resume/mine');
	}
	const resumes = await search_by_payload<
		Pick<Resume, 'i' | 'd' | 'l' | 'h'>
	>({ s: 'e' }, true, 100);
	return { e: resumes, user: locals.user };
};
