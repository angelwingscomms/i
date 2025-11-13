import { error, redirect } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { PageServerLoad } from './$types';
import type { Event } from '$lib/types';

export const load: PageServerLoad = async ({
	locals,
	params
}) => {
	if (!locals.user) {
		throw redirect(303, '/google');
	}
	const e = await get<
		Pick<
			Event,
			'u' | 'b' | 't' | 'd' | 'l' | 's' | 'v' | 'c'
		>
	>(params.i, [
		'u',
		'b',
		't',
		'd',
		'l',
		's',
		'v',
		'c'
	]);
	if (!e) {
		throw error(404, 'Event not found');
	}
	if (e.s !== 'ev') {
		throw error(404, 'This entity is not an event');
	}
	if (e.u !== locals.user.i) {
		throw error(403, "You don't own this event");
	}
	return {
		p: { ...e, i: params.i }
	};
};
