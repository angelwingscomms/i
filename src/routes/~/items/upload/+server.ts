import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { upload_image } from '$lib/integrations/r2_storage';

export const POST: RequestHandler = async ({
	request,
	locals,
	platform
}) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const form = await request.formData();
	const files = form
		.getAll('files')
		.filter((f): f is File => f instanceof File);
	console.log(
		'Upload server: Files received:',
		files.length,
		files.map((f) => f?.name || 'no name')
	);
	console.log(
		'Upload server: R2 available:',
		!!platform?.env?.R2
	);
	if (!files.length) return json({ x: [] });

	// Check if R2 is available
	if (!platform?.env?.R2) {
		console.warn(
			'R2 bucket not available, skipping upload'
		);
		return json({ x: [] });
	}

	const urls: string[] = [];
	for (const file of files) {
		try {
			console.log(
				'Upload server: Uploading file:',
				file.name
			);
			const url = await upload_image(
				file,
				undefined,
				platform
			);
			console.log('Upload server: Uploaded to:', url);
			urls.push(url);
		} catch (e) {
			console.error(
				'R2 upload error for',
				file.name,
				e
			);
		}
	}
	return json({ x: urls });
};
