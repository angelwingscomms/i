import { GEMINI } from '$env/static/private';
import type { User } from '$lib/types';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

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
) => {
	if (!self.d || !user.d) return;

	try {
		const provider = ensure_google();
		const { text } = await generateText({
			model: google('gemini-flash-latest'),
			prompt: `<context>
				You are an AI assistant designed to compare two user profiles and identify their precise commonalities.
			</context>

			<task>
				Identify things in common between the two users provided.
				Return ONLY these commonalities.
			</task>

			<input>
				<user_self_name>${self.t}</user_self_name>
				<user_self_description>${self.d}</user_self_description>

				<user_other_name>${user.t}</user_other_name>
				<user_other_description>${user.d}</user_other_description>
			</input>

			<output_format>
				- Present commonalities as simple bullet points.
				- Be extremely concise and straight to the point.
				- Refer to <user_self_name> as 'you'.
				- Do not include any greetings or introductory phrases.
				- Be exact: only list what is explicitly shared.
				- Keep all other information private.
			</output_format>`,
			temperature: 0
		});

		return text.trim();
	} catch (comparisonError) {
		console.error(
			'Comparison error:',
			comparisonError
		);
		// Return fallback message if comparison fails
		return 'Comparison temporarily unavailable';
	}
};
