import { json } from '@sveltejs/kit';
import { search_zones } from '$lib/db/zone';

export const POST = async ({ request }) => {
	const { q } = await request.json();
	const zones = await search_zones(q);
	return json(zones);
};
