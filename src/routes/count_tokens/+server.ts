import { GoogleGenerativeAI } from '@google/generative-ai';
import { json } from '@sveltejs/kit';
import { GOOGLE_API_KEY } from '$env/static/private';

let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | undefined;

if (GOOGLE_API_KEY) {
	try {
		const ai = new GoogleGenerativeAI(GOOGLE_API_KEY);
		model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
	} catch (e) {
		console.error('Error initializing GoogleGenerativeAI:', e);
	}
}

export const POST = async ({ request }) => {
	if (!model) return json({ error: 'Token counting not configured' }, { status: 500 });
	const { text } = await request.json();
	if (typeof text !== 'string') return json({ error: 'text must be string' }, { status: 400 });
	try {
		const res = await model.countTokens({ contents: [{ role: 'user', parts: [{ text }] }] });
		return json({ tokenCount: res.totalTokens ?? 0 });
	} catch (err) {
		console.error('countTokens error', err);
		return json({ error: 'failed to count tokens' }, { status: 500 });
	}
};
