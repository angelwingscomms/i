import { generate } from '$lib/util/ai/generate';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const data = new URLSearchParams(
			await request.text()
		);
		const message = data.get('message');

		if (!message) {
			return { error: 'No message provided' };
		}

		try {
			const response = await generate(message);
			return { response };
		} catch (error) {
			console.error('Error calling generate:', error);
			return { error: 'Failed to get response' };
		}
	}
};
