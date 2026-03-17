import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { qdrant } from '$lib/db';
import { collection } from '$lib/constants';
import { dev } from '$app/environment';

export const GET: RequestHandler = async () => {
	if (!dev) {
		error(404);
	}

	const scrollResults = await qdrant.scroll(collection, {
		filter: {},
		with_payload: false,
		limit: 10000
	});

	const points =
		'points' in scrollResults
			? scrollResults.points
			: scrollResults;

	for (const p of points || []) {
		const id = p.id as string;
		if (!id) continue;
		await qdrant.delete(collection, {
			points: [id],
			wait: true
		});
	}

	return new Response('.');
};
