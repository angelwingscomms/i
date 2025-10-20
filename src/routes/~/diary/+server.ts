import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { create } from '$lib/db';
import { diary_day_range, diary_payload } from '$lib/util/diary';

export const POST: RequestHandler = async ({
	locals,
	request
}) => {
	const user = locals.user;
	if (!user) error(401, 'not authorized');

	const body = await request.json().catch(() => ({}));
	const day = typeof body.d === 'string' ? body.d : null;

	let timestamp = Date.now();
	if (day) {
		const { start } = diary_day_range(day);
		timestamp = start;
	}

	const id = await create(
		diary_payload({
			text: '',
			user: user.i,
			date: timestamp
		}),
		`{text:"",date:"${new Date(timestamp).toISOString()}"}`
	);

	return json({ i: id });
};
