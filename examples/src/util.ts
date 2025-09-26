import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Item } from '$lib/types';

const genai = new GoogleGenerativeAI(
	process.env.GEMINI_API_KEY!
);

export async function generate_description(
	t: string
): Promise<string> {
	const model = genai.getGenerativeModel({
		model: 'gemini-2.5-flash'
	});
	const result = await model.generateContent(
		`describe: ${t}`
	);
	return result.response.text();
}

export function format_date(a: number): string {
	return new Date(a).toLocaleDateString();
}
