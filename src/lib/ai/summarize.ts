import { GEMINI } from '$env/static/private';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const summarize = async (body: string): Promise<string> => {
	const genAI = new GoogleGenerativeAI(GEMINI);
	const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
	const prompt = `Summarize the following post body in 1-2 sentences:\n\n${body}`;
	const result = await model.generateContent(prompt);
	const response = await result.response;
	return response.text().trim();
};