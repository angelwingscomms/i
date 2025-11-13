import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	transcribe_audio,
	extract_item_from_text
} from '$lib/util/ai/item_extract';

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
	const audio = form.get('audio');
	const context =
		(form.get('context') as string) || '';

	if (!(audio instanceof File)) {
		return json(
			{ error: 'missing audio file' },
			{ status: 400 }
		);
	}

	try {
		const transcript = await transcribe_audio(audio);
		const extraction = await extract_item_from_text(
			transcript,
			context
		);
		return json({ transcript, data: extraction });
	} catch (err) {
		console.error('voice extraction failed', err);
		return json(
			{ error: 'voice extraction failed' },
			{ status: 500 }
		);
	}
};
