import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { search_by_payload } from '$lib/db';
import type { Message } from '$lib/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI } from '$env/static/private';

export const POST: RequestHandler = async ({
	request,
	locals
}) => {
	const { r } = (await request.json()) as {
		r: string;
	};
	const last = (
		await search_by_payload<Message>(
			{ s: 'm', r },
			['d', 'm', 'tc'],
			1,
			{
				key: 'd',
				direction: 'desc'
			}
		)
	)[0];

	if (!GEMINI) {
		const suggestion = last?.m
			? `You could reply: "${last.m.slice(0, 64)}..."`
			: 'Say hello 👋';
		return json({ s: suggestion });
	}

	const genAI = new GoogleGenerativeAI(GEMINI);
	const model = genAI.getGenerativeModel({
		model: 'gemini-2.5-flash'
	});

	let prompt =
		'Suggest a short, concise, and natural-sounding reply for a chat conversation. ';
	if (last?.m) {
		prompt += `The last message in the conversation was: "${last.m}"`;
	} else {
		prompt += 'Start a new conversation.';
	}

	try {
		const result =
			await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();
		return json({ s: text });
	} catch (e) {
		console.error('Gemini API error:', e);
		const suggestion = last?.m
			? `You could reply: "${last.m.slice(0, 64)}..."`
			: 'Say hello 👋';
		return json({ s: suggestion });
	}
};
