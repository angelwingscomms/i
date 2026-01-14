import { qdrant } from '$lib/db';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	if (!locals.user) error(401, 'not logged in');
	
	// Get the desire
	const desire = await qdrant.scroll('i', {
		filter: { i: params.i }
	});
	
	if (!desire.points[0]) error(404, 'desire not found');
	
	const payload = desire.points[0].payload as {
		s: string;
		i: string[];
		d: string[];
		u: string;
	};
	
	if (payload.s !== 'd') error(400, 'this is not a desire');
	
	// Check if current user is in the desire
	if (!payload.i.includes(locals.user.i)) {
		error(403, 'not authorized to access this desire');
	}
	
	return {
		d: payload
	};
};