import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { get } from '$lib/db';
import type { SyncProject } from '$lib/types';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	const { i } = params;
	if (!i) throw error(400, 'missing sync id');

	const project = await get<SyncProject>(i, [
		's',
		'u',
		'd',
		'n',
		't',
		'm',
		'l',
		'g'
	]);

	if (!project || project.s !== 'sync') {
		throw error(404, 'sync project not found');
	}

	if (!locals.user || project.u !== locals.user.i) {
		throw error(403, 'not authorized');
	}

	return {
		s: {
			...project,
			i
		}
	};
};
