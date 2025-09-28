import { GEMINI } from '$env/static/private';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function gemini(
	prompt: string
): Promise<string> {
	const genAI = new GoogleGenerativeAI(GEMINI);
	const model = genAI.getGenerativeModel({
		model: 'gemini-flash-latest'
	});
	const result = await model.generateContent(prompt);
	const response = result.response;
	return response.text().trim();
}
