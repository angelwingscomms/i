import { error } from '@sveltejs/kit';
import { get, search_by_payload } from '$lib/db';
import type { PageServerLoad } from './$types';
import type { Resume, User } from '$lib/types';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	const resumes = await search_by_payload<
		Pick<Resume, 'u' | 'h' | 'd' | 'l' | 's' | 'i'>
	>({ s: 'e', x: params.user }, true, 1);
	
	const resume = resumes[0];
	if (!resume) {
		throw error(404, 'Resume not found');
	}
	if (resume.s !== 'e') {
		throw error(404, 'This entity is not a resume');
	}

	if (!resume.u) {
		throw error(404, 'Resume has no owner');
	}
	// if (resume.u !== params.user) {
	// 	throw error(
	// 		404,
	// 		'Resume does not belong to this user'
	// 	);
	// }
	const owner = await get<Pick<User, 't' | 's'>>(
		resume.u,
		['t', 's']
	);
	if (!owner || owner.s !== 'u') {
		throw error(404, 'Owner not found');
	}

	return {
		r: { ...resume, i: (params as any).r },
		user: locals.user,
		owner: { t: owner.t }
	};
};
