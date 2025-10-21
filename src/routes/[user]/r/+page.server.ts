import { error } from '@sveltejs/kit';
import { search_by_payload } from '$lib/db';
import type { PageServerLoad } from './$types';
import type { Resume, User } from '$lib/types';

export const load: PageServerLoad = async ({
	params
}) => {
	const u = (
		await search_by_payload(
			{ s: 'u', t: params.user },
			['t'],
			1
		)
	)[0] as Pick<User, 't'> & { i: string };

	if (!u) {
		error(404, 'User not found');
	}
	const r = (
		await search_by_payload<Resume>(
			{ s: 'e', u: u.i },
			true,
			1
		)
	)[0];

	if (!r) {
		throw error(404, 'Resume not found');
	}
	if (r.s !== 'e') {
		throw error(404, 'This entity is not a resume');
	}

	return {
		r,
		u
	};
};
