import { error, redirect } from '@sveltejs/kit';
import { create } from '$lib/db';

export const load = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Not logged in');
	const parent_id = params.i;
	const subpost_id = await create(
		{
			s: 'p',
			u: locals.user.i,
			f: parent_id,
			d: Date.now(),
			v: ''
		},
		''
	);
	throw redirect(302, `/posts/${subpost_id}/edit`);
};
