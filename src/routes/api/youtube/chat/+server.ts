import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI } from '$env/static/private';

interface Body {
	title: string;
	description?: string;
	transcript?: string;
	messages?: {
		role: 'user' | 'model';
		text: string;
	}[];
}

export const POST: RequestHandler = async ({
	request
}) => {
	const {
		title,
		description = '',
		transcript = '',
		messages = []
	} = (await request.json()) as Body;
	if (!title?.trim())
		throw error(400, 'title required');

	if (!GEMINI) {
		const last = messages.at(-1)?.text || '';
		return json({
			t: `No API key configured. You asked: ${last.slice(0, 120)}...`
		});
	}

	try {
		const ai = new GoogleGenerativeAI(GEMINI);
		const model = ai.getGenerativeModel({
			model: 'gemini-1.5-flash'
		});

		const system = `You are a helpful assistant. Use the provided YouTube video context.
If an answer is not in the context, say you don't know instead of guessing.
Keep answers concise. Include timestamps only if clear from text.`;

		const context = `Context:\nTitle: ${title}\nDescription: ${description}\nTranscript:\n${transcript.slice(0, 20000)}`;

		const convo = [
			{
				role: 'user' as const,
				parts: [{ text: system }]
			},
			{
				role: 'user' as const,
				parts: [{ text: context }]
			},
			...messages.map((m) => ({
				role:
					m.role === 'user'
						? ('user' as const)
						: ('model' as const),
				parts: [{ text: m.text }]
			}))
		];

		const res = await model.generateContent({
			contents: convo
		});
		const text = res.response.text().trim();
		return json({ t: text });
	} catch (e) {
		console.error('Gemini chat error', e);
		throw error(502, 'Failed to chat');
	}
};
