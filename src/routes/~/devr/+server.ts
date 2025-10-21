import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { count, qdrant } from '$lib/db';
import { collection } from '$lib/constants';
import { dev } from '$app/environment';

// // Deletes all rooms that are not one-on-one ("|") or anon ("-")
export const GET: RequestHandler = async () => {
	// 	if (!dev) {
	// 		error(403);
	// 	}
	// 	// const filter = {
	// 	// 	must: [
	// 	// 		{
	// 	// 			key: 's',
	// 	// 			match: {
	// 	// 				value: 'r'
	// 	// 			}
	// 	// 		}
	// 	// 	]
	// 	// };

	// 	// Get all resumes
	// 	const resumes = await qdrant.scroll(collection, {
	// 		filter: {
	// 			must: [{ key: 's', match: { value: 'e' } }]
	// 		},
	// 		with_payload: true,
	// 		limit: 10000
	// 	});

	// 	// For each resume, get the user and set resume.x to user.t
	// 	for (const resume of resumes.points || []) {
	// 		const userId = resume.payload?.u as string;
	// 		if (!userId) continue;

	// 		// Get the user
	// 		const userResults = await qdrant.retrieve(collection, {
	// 			ids: [userId],
	// 			with_payload: ['t']
	// 		});

	// 		if (userResults.length > 0) {
	// 			const userTag = userResults[0].payload?.t as string;
	// 			if (userTag) {
	// 				// Update resume.x with user.t
	// 				await qdrant.setPayload(collection, {
	// 					wait: true,
	// 					payload: { xi: userResults[0].id },
	// 					points: [resume.id as string]
	// 				});
	// 			}
	// 		}
	// 	}

	// First fetch all points that match the filter, then delete them one-by-one
	// const scrollResults = await qdrant.query(
	// 	collection,
	// 	{
	// 		filter: {
	// 			must: {
	// 				key: 's',
	// 				match: { value: 'z' }
	// 			}
	// 		},
	// 		with_payload: false,
	// 		limit: 10000
	// 	}
	// );

	// const points =
	// 	'points' in scrollResults
	// 		? scrollResults.points
	// 		: scrollResults;
	// for (const p of points || []) {
	// 	const id = p.id as string;
	// 	if (!id) continue;
	// 	if (
	// 		[
	// 			'0199e369-4958-77ff-8379-d1c8a9f0188a',
	// 			'0199f288-3244-72a4-8e99-fa32e4023d3e'
	// 		].includes(id)
	// 	) {
	// 		continue;
	// 	}
	// 	// delete each point by id, waiting for completion
	// 	await qdrant.delete(collection, {
	// 		points: [id],
	// 		wait: true
	// 	});
	// }

	// 	// await qdrant.delete(collection, {
	// 	// 	points: ['01996853-b692-71eb-9d4d-1a67771bb15d']
	// 	// });

	return new Response('.');
};
