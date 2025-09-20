import { error, text } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { get } from '$lib/db';
import { create } from '$lib/db';
import { GEMINI } from '$env/static/private';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Item } from '$lib/types/item';

async function summarize(
	a: string
): Promise<string | undefined> {
	if (!a?.trim()) return undefined;
	try {
		if (!GEMINI) return a.slice(0, 160);
		const ai = new GoogleGenerativeAI(GEMINI);
		const model = ai.getGenerativeModel({
			model: 'gemini-1.5-flash'
		});
		const prompt = `Summarize the following description into one concise sentence (<= 30 words), keep it neutral and helpful, no emojis.\n\n"""${a}"""`;
		const res = await model.generateContent({
			contents: [
				{ role: 'user', parts: [{ text: prompt }] }
			]
		});
		const text = res.response.text().trim();
		return text || a.slice(0, 160);
	} catch {
		return a.slice(0, 160);
	}
}

export const POST: RequestHandler = async ({
	request,
	params,
	locals
}) => {
	if (!locals.user) throw error(401, 'Unauthorized');
	const { i } = params;
	const existing = await get<Item>(i);
	if (!existing || existing.s !== 'i') throw error(404, 'Item not found');
	if (existing.u !== locals.user.i) throw error(403, 'Not owner');

	const { t, a, k, v, x } = (await request.json()) as {
		t: string;
		a: string;
		k?: 0 | 1;
		v?: number;
		x?: string[];
	};

	const q = a.trim().length > 1440 ? await summarize(a) : existing.q;
	const payload: Item = {
		...existing,
		s: 'i',
		t: t.trim(),
		a: a.trim(),
		q,
		k: k ?? existing.k ?? 0,
		v: v ?? existing.v ?? 0,
		...(x ? { x } : {}),
		d: existing.d // keep original date
	};
	const string_to_embed = JSON.stringify({about: a, name: payload.t });
	const id = await create(payload, string_to_embed, i);
	return text(id);
};