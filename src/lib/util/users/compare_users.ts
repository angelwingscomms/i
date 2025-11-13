import { GEMINI } from '$env/static/private';
import type { User } from '$lib/types';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const google_provider = GEMINI
	? google({ apiKey: GEMINI })
	: null;

export const compare_users = async (
	self: Partial<User>,
	user: Partial<User>
) => {
	if (!self.d || !user.d) return;
	if (!google_provider) {
		console.error('missing gemini api key');
		return;
	}

	try {
		const { text } = await generateText({
			model: google_provider('gemini-2.5-flash'),
			prompt: `<context>
				You are an AI assistant designed to compare two user profiles and identify their precise commonalities.
			</context>

			<task>
				Identify shared interests, values, personality traits, and goals between the two users provided.
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
				- Maintain a casual and friendly tone.
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
		// Continue without comparison if it fails
	}
};
