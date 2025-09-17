import { error } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { PageServerLoad } from './$types';
import type { Resume, User } from '$lib/types';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	const resume = await get<
		Pick<Resume, 'u' | 'h' | 'd' | 'l' | 's'>
	>(params.i, ['u', 'h', 'd', 'l', 's']);
	if (!resume) {
		throw error(404, 'Resume not found');
	}
	if (resume.s !== 'e') {
		throw error(404, 'This entity is not a resume');
	}

	const owner = await get<Pick<User, 't' | 's'>>(
		resume.u,
		['t', 's']
	);
	if (!owner || owner.s !== 'u') {
		throw error(404, 'Owner not found');
	}

	return {
		r: { ...resume, i: params.i },
		user: locals.user,
		owner: { t: owner.t }
	};
};
