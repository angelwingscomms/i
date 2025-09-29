import { GROQ_API_KEY } from '$env/static/private';
import Groq from 'groq-sdk';

export async function qwen(
	prompt: string
): Promise<string> {
	const client = new Groq({
		apiKey: GROQ_API_KEY
	});

	const chatCompletion =
		await client.chat.completions.create({
			messages: [{ role: 'user', content: prompt }],
			model: 'qwen/qwen3-32b',
			max_tokens: 40960
		});

	return (
		chatCompletion.choices[0]?.message?.content?.trim() ||
		''
	);
}
