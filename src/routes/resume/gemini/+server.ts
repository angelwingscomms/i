import { json, error } from '@sveltejs/kit';
import { GEMINI } from '$env/static/private';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
	search_by_payload,
	edit_point,
	get
} from '$lib/db';
import type { Resume } from '$lib/types';

export const POST = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}
	const { i, instructions } = await request.json();
	if (!i || !instructions?.trim()) {
		throw error(400, 'Resume ID and edit instructions required');
	}
	const resume = await get<Resume>(i, ['u', 'h', 'txt']);
	if (!resume) {
		throw error(404, 'Resume not found');
	}
	if (resume.u !== locals.user.i) {
		throw error(403, "You don't own this resume");
	}
	const genAI = new GoogleGenerativeAI(GEMINI);
	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash'
	});
	const prompt = `Write a complete HTML/CSS resume page. Current resume HTML: ${resume.h}. Current text content: ${resume.txt}. Edit according to these instructions: ${instructions}. Output only the HTML code with embedded CSS in the <style> tag. Make it professional and responsive.`;
	const result = await model.generateContent(prompt);
	const response = await result.response;
	const new_h = response.text().trim();
	const updated = await edit_point(i, {
		h: new_h,
		l: Date.now()
	});
	return json({
		success: true,
		resume: { ...resume, h: new_h, l: Date.now() }
	});
};
