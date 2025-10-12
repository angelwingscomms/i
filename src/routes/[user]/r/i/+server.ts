import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { search_by_payload } from '$lib/db';
import type { Resume, User } from '$lib/types';

export const GET: RequestHandler = async ({
	params
}) => {
	const u = (
		await search_by_payload(
			{ s: 'u', t: params.user },
			['t'],
			1
		)
	)[0] as Pick<User, 't'> & { i: string };
	const r = (
		await search_by_payload<Resume>(
			{ s: 'e', u: u.i },
			true,
			1
		)
	)[0];

	if (!u) {
		throw error(404, 'User not found');
	}

	if (!r) {
		throw error(404, 'Resume not found');
	}
	if (r.s !== 'e') {
		throw error(404, 'This entity is not a resume');
	}
	return new Response(r.h || '', {
		status: 200,
		headers: {
			'content-type': 'text/html; charset=utf-8'
		}
	});
};
