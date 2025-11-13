import { json } from '@sveltejs/kit';
import { search_zones } from '$lib/db/zone';
import { search_openstreetmap } from '$lib/integrations/openstreetmap';

export const POST = async ({ request }) => {
	const { q, source } = await request.json();
	if ((source as string) === 'osm') {
		try {
			const results = await search_openstreetmap(
				q ?? '',
				8
			);
			return json(results);
		} catch (error) {
			console.error(
				'openstreetmap search error',
				error
			);
			return json([], { status: 500 });
		}
	}
	const zones = await search_zones(q);
	return json(zones);
};
