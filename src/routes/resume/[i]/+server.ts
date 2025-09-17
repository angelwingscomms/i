import {
	json,
	type RequestHandler
} from '@sveltejs/kit';
import { edit_point, get } from '$lib/db';
import type { Resume } from '$lib/types';

export const PUT: RequestHandler = async ({
	locals,
	params,
	request
}) => {
	if (!locals.user) {
		return json(
			{ error: 'unauthorized' },
			{ status: 401 }
		);
	}

	const resume = await get<Resume>(params.i);
	if (
		!resume ||
		resume.s !== 'e' ||
		resume.u !== locals.user.i
	) {
		return json(
			{ error: 'forbidden' },
			{ status: 403 }
		);
	}

	const h = await request.text();

	await edit_point(params.i, {
		h,
		l: Date.now()
	});

	return new Response();
};
