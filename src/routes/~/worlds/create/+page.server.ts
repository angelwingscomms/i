import { create_world } from '$lib/db/world';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { e: 'not authenticated' });
		}
		const form = await request.formData();
		const name = (form.get('n') as string | null)?.trim() || '';
		const about = (form.get('a') as string | null)?.trim() || '';
		const meta_raw = (form.get('j') as string | null) || '';
		if (!name) {
			return fail(400, { e: 'name required' });
		}
		let meta: Record<string, unknown> | undefined;
		if (meta_raw.trim()) {
			try {
				meta = JSON.parse(meta_raw);
			} catch (error) {
				return fail(400, { e: 'invalid json' });
			}
		}
		try {
			const world_id = await create_world(
				locals.user.i,
				name,
				about,
				meta
			);
			throw redirect(302, `/~/worlds/${world_id}`);
		} catch (error) {
			console.error('world create failed', error);
			return fail(500, { e: 'failed to create world' });
		}
	}
};
