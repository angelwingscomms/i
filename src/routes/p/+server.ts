import { json, error } from '@sveltejs/kit';
import type { LocalsUser } from '$lib/types';
import { create_post } from '$lib/db/post';
import { update_post } from '$lib/db/post';

export const POST = async ({ locals, request }: { locals: { user?: LocalsUser }; request: Request }) => {
	if (!locals.user) return error(401, 'Unauthorized');
	const formData = await request.formData();
	const m = formData.get('m') as string || undefined;
	const b = formData.get('b') as string || undefined;
	const id = await create_post(locals.user.i);
	if (m || b) {
		const update_data = { m, b };
		await update_post(id, update_data);
	}
	return json({ i: id });
};