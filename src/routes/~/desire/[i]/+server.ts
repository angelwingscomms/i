import { json, error } from '@sveltejs/kit';
import { qdrant } from '$lib/db';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({
	request,
	params,
	locals
}) => {
	if (!locals.user) error(401, 'not logged in');
	
	try {
		const formData = await request.formData();
		const d = formData.get('d') as string;
		
		// Get current desire
		const current = await qdrant.scroll('i', {
			filter: { i: params.i }
		});
		
		if (!current.points[0]) error(404, 'desire not found');
		
		const payload = current.points[0].payload as {
			s: string;
			i: string[];
			d: string[];
			u: string;
		};
		
		if (payload.s !== 'd') error(400, 'this is not a desire');
		
		// Check if current user is in the desire
		if (!payload.i.includes(locals.user.i)) {
			error(403, 'not authorized to update this desire');
		}
		
		// Find the index of the current user
		const userIndex = payload.i.indexOf(locals.user.i);
		
		// Update the desire for this user
		const updatedDesires = [...payload.d];
		updatedDesires[userIndex] = d;
		
		// Update payload
		await qdrant.setPayload('i', {
			wait: true,
			payload: {
				...payload,
				d: updatedDesires,
				u: locals.user.i
			},
			points: [params.i]
		});
		
		return json({ success: true });
	} catch (e) {
		console.error(e.response?.data || e.message);
		error(500, 'server error');
	}
};