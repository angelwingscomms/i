import { redirect, error, fail } from '@sveltejs/kit';
import { create_zone, get_zone, update_zone } from '$lib/db/zone';

export const load = async ({ locals }) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Not logged in');
	}
	const id = await create_zone(user.i);
	const z = await get_zone(id);
	if (!z) {
		throw error(500, 'Failed to create zone');
	}
	return { z };
};

/** @satisfies {import('./$types').Actions} */
export const actions = {
	default: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			throw error(401, 'Not logged in');
		}
		const formData = await request.formData();
		const n = formData.get('n') as string;
		const l_str = formData.get('l') as string;
		const g_str = formData.get('g') as string;
		const i = formData.get('i') as string;
		const l = parseFloat(l_str);
		const g = parseFloat(g_str);
		if (!n || isNaN(l) || isNaN(g) || !i) {
			return fail(400, { invalid: true });
		}
		await update_zone(i, { n, l, g });
		throw redirect(302, `/zones/${i}`);
	}
};