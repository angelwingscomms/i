import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import { upload_image } from '$lib/integrations/r2_storage';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI } from '$env/static/private';
import { create } from '$lib/db';
import type { Meme, Room } from '$lib/types';
import { realtime } from '$lib/util/realtime';

export const POST: RequestHandler = async ({ request, locals, platform }) => {
	if (!locals.user || !locals.user.i) throw error(401, 'Unauthorized');
	const form = await request.formData();
	const file = form.get('file');
	if (!(file instanceof File)) throw error(400, 'file required');
	if (!file.type.startsWith('image/')) throw error(400, 'only image files allowed');

	if (!platform?.env?.R2) throw error(500, 'R2 not configured');
	let url = '';
	try {
		url = await upload_image(file, undefined, platform);
	} catch (e) {
		console.error('R2 upload error', e);
		throw error(502, 'upload failed');
	}

	// Ask Gemini for an opinionated summary
	let summary = '';
	if (GEMINI) {
		try {
			const ai = new GoogleGenerativeAI(GEMINI);
			const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
			const prompt = `Create an opinionated summary of this meme image. This summary will be embedded and used for search functionality.`;
			const res = await model.generateContent({
				contents: [
					{ role: 'user', parts: [{ text: prompt }, { text: url }] }// simple: provide URL reference
				]
			});
			summary = res.response.text().trim();
		} catch (e) {
			console.error('gemini summarize error', e);
		}
	}

	// Create chatroom for this meme
	let room_id = '';
	try {
		const meeting = await realtime.post('meetings', { title: 'meme' });
		const room_payload: Omit<Room, 'i'> & { s: 'r' } = {
			s: 'r',
			t: summary?.slice(0, 48) || 'meme',
			a: 'meme comments',
			c: '',
			q: meeting.data.data.id,
			_: '.',
			u: locals.user.i,
			d: Date.now()
		};
		room_id = await create(room_payload, JSON.stringify({ room_type: 'meme', meme_summary: summary }));
	} catch (e) {
		console.error('room create error', e);
		throw error(500, 'failed to create chatroom');
	}

	// Create meme entity
	let meme_id = '';
	try {
		meme_id = await create<Meme>({ s: 'e', u: locals.user.i, l: url, p: 0, a: summary, d: Date.now(), r: room_id }, summary);
	} catch (e) {
		console.error('meme create error', e);
		throw error(500, 'failed to save meme');
	}

	return json({ ok: true, id: room_id, meme: meme_id });
};

