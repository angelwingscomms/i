import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { search_by_payload } from '$lib/db';

export const load: PageServerLoad = async ({
	params
}) => {
	const { t } = params;

	if (!t) {
		throw redirect(302, '/~/event');
	}

	try {
		const events = await search_by_payload(
			{
				s: 'ev',
				tag: t
			},
			['i'],
			1
		);

		if (events.length === 0) {
			throw redirect(302, '/~/event');
		}

		const event = events[0];
		throw redirect(302, `/~/event/${event.i}`);
	} catch (error) {
		if (
			error instanceof Response &&
			error.status >= 300 &&
			error.status < 400
		) {
			throw error;
		}
		throw redirect(302, '/~/event');
	}
};
