import { error, text } from '@sveltejs/kit';
import { GEMINI } from '$env/static/private';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { create } from '$lib/db';
import type { Resume } from '$lib/types';

export const POST = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}
	let id
	try {
		const d = Date.now()
		id = await create({s: 'e', u: locals.user.i, d, l: d });
	} catch (err) {
		console.error('Failed to create resume', err);
		throw error(500, 'Failed to create resume');
	}
	return text(id, { status: 201 });
	const txt = await request.text();
	if (!txt?.trim()) {
		throw error(400, 'Resume text required');
	}
	const genAI = new GoogleGenerativeAI(GEMINI);
	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash'
	});
	const prompt = `Write a complete HTML/CSS resume page from: ${txt}. Make it professional, responsive, and visually appealing. Output only the HTML code with embedded CSS in the <style> tag.`;
	const result = await model.generateContent(prompt);
	const response = await result.response;
	const h = response.text().trim();
	const resume: Resume = {
		s: 'e',
		u: locals.user.i,
		h,
		d: Date.now(),
		l: Date.now()
	};

	try {
		const id = await create(resume, txt);
		return text(id, { status: 200 });
	} catch (err) {
		console.error('Failed to create resume', err);
		throw error(500, 'Failed to create resume');
	}
};
