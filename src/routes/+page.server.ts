// import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { qdrant } from '$lib/db';
import { format_filter } from '$lib/db';
import { collection } from '$lib/constants';

export const load: PageServerLoad = async ({ locals }) => {
	// if (!locals.user) {
	// 	redirect(302, '/google');
	// }

	// delete all users except the whitelist
	// try {
	// const filter = {
	// 	must: [{ key: 's', match: { value: 'u' } }],
	// 	must_not: [
	// 		{
	// 			should: [
	// 				{ key: 't', match: { value: 'joyahayo07' } },
	// 				{ key: 't', match: { value: 'Zia' } },
	// 				{ key: 't', match: { value: 'eniolaw84' } }
	// 			]
	// 		}
	// 	]
	// };

	// 	await qdrant.delete(collection, { wait: true, filter });
	// } catch (e) {
	// 	console.error('delete users error', e);
	// }

	return {
		user: locals.user
	};
};
