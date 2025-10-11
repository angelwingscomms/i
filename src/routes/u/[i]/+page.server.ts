import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get } from '$lib/db';

export const load: PageServerLoad = async ({
	params
}) => {
	const { i } = params;
	const user = await get<{ t: string }>(i);
	if (!user) {
		throw redirect(302, '/u');
	}
	throw redirect(302, `/${user.t}`);
};
