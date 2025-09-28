import { json, error, text } from '@sveltejs/kit';
import { edit_point, get } from '$lib/db';
import { get_user_colors } from '$lib/util/colors';
import { gemini } from '$lib/util/gemini';
import type { Resume } from '$lib/types';

export const POST = async ({
	request,
	locals,
	params
}) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}
	const instructions = await request.text();
	const i = params.i;
	if (!i || !instructions?.trim()) {
		throw error(
			400,
			'Resume ID and edit instructions required'
		);
	}
	const resume = await get<Resume>(i, [
		'u',
		'h',
		'txt'
	]);
	if (!resume) {
		throw error(404, 'Resume not found');
	}
	if (resume.u !== locals.user.i) {
		throw error(403, "You don't own this resume");
	}
	const colors = await get_user_colors(resume.u);
	const colorStr = colors
		.map((c) => `#${c}`)
		.join(', ');
	const prompt = `Write a complete HTML/CSS resume page. Current resume HTML: ${resume.h}. Current text content: ${resume.txt}. Edit according to these instructions: ${instructions}. Incorporate these user colors into the design where appropriate: ${colorStr}. Output only the HTML code with embedded CSS in the <style> tag. Make it professional and responsive.`;
	let new_h = await gemini(prompt);
	new_h = new_h
		.replace(/^```html\s*\n?/, '')
		.replace(/\n?```$/, '')
		.trim();
	await edit_point(i, {
		h: new_h,
		l: Date.now()
	});
	return text(new_h);
};
