import { error } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { PageServerLoad } from './$types';
import type { Resume } from '$lib/types';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	const resume = await get<
		Pick<Resume, 'u' | 'h' | 'd' | 'l' | 's'>
	>(params.i, ['u', 'h', 'd', 'l', 's', 't']);
	if (!resume) {
		throw error(404, 'Resume not found');
	}
	if (resume.s !== 'e') {
		throw error(404, 'This entity is not a resume');
	}
	return {
		r: { ...resume, i: params.i },
		user: locals.user
	};
};
