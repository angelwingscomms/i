import type { PageServerLoad } from './$types';
import type { LocalsUser } from '$lib/types';
import { redirect } from '@sveltejs/kit';
import { create_post } from '$lib/db/post';

export const load: PageServerLoad = async ({ locals }: { locals: { user?: LocalsUser } }) => {
	if (!locals.user) redirect(302, '/google?next=/p/create');
	const id = await create_post(locals.user.i);
	throw redirect(302, `/p/${id}/edit`);
};