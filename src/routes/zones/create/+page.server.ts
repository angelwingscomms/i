import { redirect, error } from '@sveltejs/kit';
import { create_zone, update_zone } from '$lib/db/zone';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = locals.user;
		if (!user) {
			throw error(401, 'Not logged in');
		}
		const formData = await request.formData();
		const n = formData.get('n') as string;
		const l_str = formData.get('l') as string;
		const g_str = formData.get('g') as string;
		const l = parseFloat(l_str);
		const g = parseFloat(g_str);
		if (!n || isNaN(l) || isNaN(g)) {
			return { success: false, message: 'Invalid input' };
		}
		const id = await create_zone(user.i);
		await update_zone(id, { n, l, g });
		throw redirect(302, `/zones/${id}`);
	}
};

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

export const actions: Actions = {
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
			return { success: false, message: 'Invalid input' };
		}
		await update_zone(i, { n, l, g });
		throw redirect(302, `/zones/${i}`);
	}
};