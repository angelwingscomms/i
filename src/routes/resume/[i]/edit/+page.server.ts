import { error, redirect } from '@sveltejs/kit';
import { get } from '$lib/db';
import { getUserColors } from '$lib/util/colors';
import type { PageServerLoad } from './$types';
import type { Resume } from '$lib/types';

export const load: PageServerLoad = async ({
	locals,
	params
}) => {
	if (!locals.user) {
		throw redirect(303, '/google');
	}
	const r = await get<
		Pick<Resume, 'u' | 'h' | 'd' | 'l' | 's'>
	>(params.i, ['u', 'h', 'd', 'l', 's']);
	if (!r) {
		throw error(404, 'Resume not found');
	}
	if (r.s !== 'e') {
		throw error(404, 'This entity is not a resume');
	}
	if (r.u !== locals.user.i) {
		throw error(403, "You don't own this resume");
	}
	const colors = await getUserColors(r.u);
	return {
		r: { ...r, i: params.i },
		colors
	};
};
