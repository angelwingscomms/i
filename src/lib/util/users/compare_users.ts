import { GEMINI } from '$env/static/private';
import type { User } from '$lib/types';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

const google = createGoogleGenerativeAI({
	apiKey: GEMINI
});

const ensure_google = () => {
	if (!google)
		throw new Error('missing gemini api key');
	return google;
};

export const compare_users = async (
	self: Partial<User>,
	user: Partial<User>
): Promise<string[] | undefined> => {
	if (!self.d || !user.d) return;

	try {
		const provider = ensure_google();
		const { object } = await generateObject({
			model: google('gemini-flash-latest'),
			schema: z.object({
				commonalities: z.array(z.string()).describe('List of things these users have in common')
			}),
			prompt: `Create a JSON list of similarities between these users.

User 1: ${self.d}
User 2: ${user.d}

Example output: ['likes sesame seeds', 'enjoys hiking', 'wants to see the world']

If either user's description is not meaningful (e.g., empty, only whitespace, or just punctuation like a fullstop), return an empty array for commonalities.`,
			temperature: 0
		});

		return object.commonalities;
	} catch (comparisonError) {
		console.error(
			'Comparison error:',
			comparisonError
		);
		// Return empty array if comparison fails
		return [];
	}
};
