import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { extract_item_from_image } from '$lib/util/ai/item_extract';

export const POST: RequestHandler = async ({
	request,
	locals
}) => {
	if (!locals.user) {
		return json(
			{ error: 'unauthorized' },
			{ status: 401 }
		);
	}

	const form = await request.formData();
	const image = form.get('image');
	const context =
		(form.get('context') as string) || '';

	if (!(image instanceof File)) {
		return json(
			{ error: 'missing image file' },
			{ status: 400 }
		);
	}

	try {
		const extraction = await extract_item_from_image(
			image,
			context
		);
		return json({ data: extraction });
	} catch (err) {
		console.error('vision extraction failed', err);
		return json(
			{ error: 'vision extraction failed' },
			{ status: 500 }
		);
	}
};
