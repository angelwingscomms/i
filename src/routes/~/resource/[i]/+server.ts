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
		const t = formData.get('t') as string;
		const d = formData.get('d') as string;
		const rx = JSON.parse(
			(formData.get('rx') as string) || '[]'
		) as string[];
		const files = formData.getAll('f') as File[];

		// Handle image removals
		if (rx.length > 0) {
			// Remove images from storage and update payload
			const current = await qdrant.scroll('i', {
				filter: { i: params.i }
			});
			if (current.points[0]) {
				const currentImages =
					(
						current.points[0].payload as {
							x?: string[];
						}
					).x || [];
				const updatedImages = currentImages.filter(
					(img: string) => !rx.includes(img)
				);
				await qdrant.setPayload('i', {
					i: params.i,
					x: updatedImages
				});
			}
		}

		// Handle new image uploads
		let newImageUrls: string[] = [];
		if (files.length > 0) {
			// Upload files to storage and get URLs
			for (const file of files) {
				const url = `https://example.com/${file.name}`; // TODO: Implement uploadImage function
				newImageUrls.push(url);
			}
		}

		// Update payload with new data
		const updateData: any = { i: params.i };
		if (t) updateData.t = t;
		if (d) updateData.d = d;
		if (newImageUrls.length > 0) {
			const current = await qdrant.scroll('i', {
				filter: { i: params.i }
			});
			const currentImages =
				(
					current.points[0]?.payload as {
						x?: string[];
					}
				).x || [];
			updateData.x = [
				...currentImages,
				...newImageUrls
			];
		}

		await qdrant.setPayload('i', updateData);
		return json({ success: true });
	} catch (e) {
		console.error(e.response?.data || e.message);
		error(500, 'server error');
	}
};

export const DELETE: RequestHandler = async ({
	params,
	locals
}) => {
	if (!locals.user) error(401, 'not logged in');
	const r = await get<{ s: string; u?: string }>(
		params.i
	);
	if (!r) error(404, 'resource not found');
	if (r.s !== 'resource')
		error(400, 'this resource is not a resource');
	if (r.u !== locals.user.i)
		error(403, 'not authorized');
	await qdrant.delete('i', { points: [params.i] });
	return new Response(null, { status: 204 });
};
