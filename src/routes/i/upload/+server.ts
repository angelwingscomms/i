import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.formData();
	const files = data.getAll('files');

	// For local dev, return dummy image URL
	const dummy_url = "https://apexlinks.org/_app/immutable/assets/items.D-CAzO1y.png";
	const x = files.length > 0 ? [dummy_url] : [];

	return json({ x });
};