import { error } from '@sveltejs/kit';
import { get_zone, update_zone } from '$lib/db/zone';
import type { Zone } from '$lib/types';
import type {
	PageServerLoad,
	Actions
} from './$types';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	const user = locals.user;
	if (!user) {
		throw error(401, 'Not logged in');
	}

	if (!params.i) {
		throw error(400, 'Invalid zone id');
	}

	const z = await get_zone(params.i);
	if (!z) {
		throw error(404, 'Zone not found');
	}

	if (z.u !== user.i) {
		throw error(403, 'You do not own this zone');
	}

	return {
		z
	};
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const user = locals.user;
		if (!user) {
			return { success: false };
		}

		if (!params.i) {
			return { success: false };
		}

		const formData = await request.formData();
		const n = formData.get('n') as string;
		const l_str = formData.get('l') as string;
		const g_str = formData.get('g') as string;
		const l = parseFloat(l_str);
		const g = parseFloat(g_str);
		if (!n || isNaN(l) || isNaN(g)) {
			return {
				success: false,
				message: 'Invalid input'
			};
		}
		await update_zone(params.i, { n, l, g });
		return { success: true };
	}
};
