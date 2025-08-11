import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { upload_image } from '$lib/integrations/ibm_cos';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const form = await request.formData();
	const files = form.getAll('files').filter((f): f is File => f instanceof File);
	if (!files.length) return json({ x: [] });

	const has_cos = !!(env.IBM_COS_ENDPOINT && env.IBM_COS_API_KEY_ID && env.IBM_COS_INSTANCE_ID && env.IBM_COS_BUCKET);
	if (!has_cos) {
		// Skip actual COS in CI if env not present
		return json({ x: [] });
	}

	const urls: string[] = [];
	for (const file of files) {
		try {
			const url = await upload_image(file);
			urls.push(url);
		} catch (e) {
			console.error('COS upload error', e);
		}
	}
	return json({ x: urls });
};

