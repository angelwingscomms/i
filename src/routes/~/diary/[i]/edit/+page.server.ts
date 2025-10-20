import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { get, edit_point } from '$lib/db';
import { embed } from '$lib/util/embed';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	const user = locals.user;
	if (!user) error(401, 'not authorized');

	const { i } = params;
	if (!i) error(400, 'missing diary id');

	const entry = await get<{
		s: string;
		u: string;
		d: number;
		a: string;
		e?: string;
	}>(i, true);

	if (!entry || entry.s !== 'diary')
		error(404, 'diary not found');

	if (entry.u !== user.i) error(403, 'forbidden');

	return { e: { ...entry, i } };
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const user = locals.user;
		if (!user) error(401, 'not authorized');

		const { i } = params;
		if (!i) error(400, 'missing diary id');

		const form = await request.formData();
		const text = form.get('text');
		const date = form.get('date');

		if (typeof text !== 'string')
			error(400, 'invalid entry');

		const timestamp =
			typeof date === 'string' && date
				? new Date(`${date}T00:00:00.000Z`).getTime()
				: Date.now();

		const embedding = await embed(
			JSON.stringify({
				text,
				date: new Date(timestamp).toISOString()
			})
		);

		await edit_point(i, {
			s: 'diary',
			u: user.i,
			d: timestamp,
			a: text,
			e: embedding
		});

		redirect(303, '/~/diary');
	}
};
