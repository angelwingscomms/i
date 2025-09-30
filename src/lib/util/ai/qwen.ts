import { GROQ } from '$env/static/private';
import Groq from 'groq-sdk';

export async function qwen(
	prompt: string
): Promise<string> {
	const client = new Groq({
		apiKey: GROQ
	});

	const chatCompletion =
		await client.chat.completions.create({
			messages: [{ role: 'user', content: prompt }],
			model: 'qwen/qwen3-32b',
			max_tokens: 40960
		});

	let content =
		chatCompletion.choices[0]?.message?.content?.trim() ||
		'';

	// Remove <think>...</think> block from the beginning of the response
	content = content
		.replace(/^<think>[\s\S]*?<\/think>/i, '')
		.trim();

	return content;
}
