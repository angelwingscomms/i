import { GEMINI } from '$env/static/private';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const google_provider = GEMINI
	? google({ apiKey: GEMINI })
	: null;

export async function generate(
	prompt: string
): Promise<string> {
	if (!google_provider) {
		throw new Error('missing gemini api key');
	}

	const { text } = await generateText({
		model: google_provider('gemini-flash-latest'),
		prompt
	});

	return text
		.replace(/^```(?:html)?\s*\n?/, '')
		.replace(/\n?```$/, '')
		.trim();
}
