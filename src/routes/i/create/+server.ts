import { error, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { create } from '$lib/db';
import { GEMINI } from '$env/static/private';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Item } from '$lib/types/item';

async function summarize(
	d: string
): Promise<string | undefined> {
	if (!d?.trim()) return undefined;
	try {
		if (!GEMINI) return d.slice(0, 160);
		const ai = new GoogleGenerativeAI(GEMINI);
		const model = ai.getGenerativeModel({
			model: 'gemini-1.5-flash'
		});
		const prompt = `Summarize the following description into one concise sentence (<= 30 words), keep it neutral and helpful, no emojis.\n\n"""${d}"""`;
		const res = await model.generateContent({
			contents: [
				{ role: 'user', parts: [{ text: prompt }] }
			]
		});
		const text = res.response.text().trim();
		return text || d.slice(0, 160);
	} catch {
		return d.slice(0, 160);
	}
}

export const POST: RequestHandler = async ({
	request,
	locals
}) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const { t, a, k, x } = (await request.json()) as {
		t: string;
		a: string;
		k?: 0 | 1;
		x?: string[];
	};

	const q = a.trim().length > 1440 ? await summarize(a) : undefined;
	const payload: Item = {
		s: 'i',
		t: t.trim(),
		a: a.trim(),
		u: locals.user.i,
		q,
		k: k ?? 0,
		d: Date.now(),
		...(x?.length ? { x } : {})
	};
	const i = await create(payload, JSON.stringify({about: a, name: payload.t }));
	return text(i);
};
