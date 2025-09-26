import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { count, qdrant } from '$lib/db';
import { collection } from '$lib/constants';
import { dev } from '$app/environment';

// Deletes all rooms that are not one-on-one ("|") or anon ("-")
export const GET: RequestHandler = async () => {
	if (!dev) {
		error(403);
	}
	// const filter = {
	// 	must: [
	// 		{
	// 			key: 's',
	// 			match: {
	// 				value: 'r'
	// 			}
	// 		}
	// 	]
	// };

	await qdrant.delete(collection, {
		wait: true,
		filter: {
			must: {
				key: 's',
				match: {
					value: 'i'
				}
			}
		}
	});

	// await qdrant.delete(collection, {
	// 	points: ['01996853-b692-71eb-9d4d-1a67771bb15d']
	// });

	return new Response('.');
};
