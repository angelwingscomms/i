import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI } from '$env/static/private';

interface Body {
	title: string;
	description?: string;
	transcript?: string;
}

export const POST: RequestHandler = async ({
	request
}) => {
	const {
		title,
		description = '',
		transcript = ''
	} = (await request.json()) as Body;
	if (!title?.trim())
		throw error(400, 'title required');

	if (!GEMINI) {
		const base = `${title}. ${description}`.trim();
		return json({ s: base.slice(0, 220) });
	}

	try {
		const ai = new GoogleGenerativeAI(GEMINI);
		const model = ai.getGenerativeModel({
			model: 'gemini-1.5-flash'
		});

		const prompt = `You are an expert video summarizer.
Summarize the following YouTube video in 5-8 concise bullet points (max 120 words total).
Focus on key takeaways and facts. Avoid hype. If transcript is noisy, infer best effort.

Title: ${title}
Description: ${description}
Transcript:\n${transcript.slice(0, 20000)}\n`;

		const res = await model.generateContent({
			contents: [
				{ role: 'user', parts: [{ text: prompt }] }
			]
		});

		const text = res.response.text().trim();
		return json({ s: text });
	} catch (e) {
		console.error('Gemini summarize error', e);
		throw error(502, 'Failed to summarize');
	}
};
