import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { upload_image } from '$lib/integrations/r2_storage';

/**
 * DEPRECATED: This endpoint is deprecated for chat message file uploads.
 * Use the message route directly for chat files. This endpoint is still
 * used for other file uploads (e.g., profile pictures, user creation).
 */

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const form = await request.formData();
	const files = form.getAll('files').filter((f): f is File => f instanceof File);
	if (!files.length) return json({ x: [] });

	// Check if R2 is available
	if (!platform?.env?.R2) {
		console.warn('R2 bucket not available, skipping upload');
		return json({ x: [] });
	}

	const urls: string[] = [];
	for (const file of files) {
		try {
			const url = await upload_image(file, undefined, platform);
			urls.push(url);
		} catch (e) {
			console.error('R2 upload error', e);
		}
	}
	return json({ x: urls });
};
