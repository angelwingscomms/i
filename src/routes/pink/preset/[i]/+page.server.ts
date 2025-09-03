import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { Preset } from '$lib/types';

export const load: PageServerLoad = async ({ params }) => {
	if (!params.i) error(400, 'missing preset id');
	const p = await get<Preset>(params.i, ['n', 'a', 'p', 'x']);
	if (!p || p.s !== 'p') error(404, 'preset not found');
	return { p: { ...p, i: params.i } };
};
