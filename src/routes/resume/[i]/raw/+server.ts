import { error } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { Resume } from '$lib/types';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({
	params
}) => {
	const resume = await get<Pick<Resume, 'h' | 's'>>(
		params.i,
		['h', 's']
	);
	if (!resume) {
		throw error(404, 'Resume not found');
	}
	if (resume.s !== 'e') {
		throw error(404, 'This entity is not a resume');
	}
	return new Response(resume.h || '', {
		status: 200,
		headers: {
			'content-type': 'text/html; charset=utf-8'
		}
	});
};
