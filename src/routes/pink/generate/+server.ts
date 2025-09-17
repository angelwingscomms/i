import type { RequestHandler } from './$types';
import { error, json } from '@sveltejs/kit';
import { GEMINI } from '$env/static/private';
import { GoogleGenAI } from '@google/genai';
import { get } from '$lib/db';
import type { Preset } from '$lib/types';

export const POST: RequestHandler = async ({
	request
}) => {
	const { prompt, x, pid, m } =
		(await request.json()) as {
			prompt?: string;
			x?: string[];
			pid?: string;
			m?: boolean;
		};

	if (pid && m) {
		const preset = await get<Preset>(pid, ['x']);
		if (!preset || preset.s !== 'p')
			throw error(404, 'preset not found');
		const need = preset.x?.length || 0;
		const have = Array.isArray(x) ? x.length : 0;
		if (need > 0 && need !== have)
			throw error(
				400,
				`upload exactly ${need} image(s)`
			);
	}

	if (!GEMINI) {
		return json({
			images: [],
			text: (prompt || '').slice(0, 200)
		});
	}

	const ai = new GoogleGenAI({ apiKey: GEMINI });
	const config = {
		responseModalities: ['IMAGE', 'TEXT']
	};
	const model = 'gemini-2.5-flash-image-preview';

	async function fetch_base64(url: string): Promise<{
		data: string;
		mimeType: string;
	} | null> {
		try {
			const res = await fetch(url);
			if (!res.ok) return null;
			const mimeType =
				res.headers.get('content-type') ||
				'image/png';
			const ab = await res.arrayBuffer();
			const b64 = Buffer.from(ab).toString('base64');
			return { data: b64, mimeType };
		} catch {
			return null;
		}
	}

	const parts: any[] = [];
	if (Array.isArray(x) && x.length) {
		for (const url of x) {
			const data = await fetch_base64(url);
			if (data) parts.push({ inlineData: data });
		}
	}
	if (prompt?.trim())
		parts.push({ text: prompt.trim() });

	const contents = [{ role: 'user', parts }];

	const images: string[] = [];
	let text = '';

	const stream =
		await ai.models.generateContentStream({
			model,
			config,
			contents
		});
	for await (const chunk of stream) {
		const part =
			chunk.candidates?.[0]?.content?.parts?.[0];
		if (!part) continue;
		if (
			'inlineData' in part &&
			part.inlineData?.data
		) {
			const mime =
				part.inlineData.mimeType || 'image/png';
			images.push(
				`data:${mime};base64,${part.inlineData.data}`
			);
		} else if ('text' in part && part.text) {
			text += part.text;
		}
	}

	return json({ images, text });
};
