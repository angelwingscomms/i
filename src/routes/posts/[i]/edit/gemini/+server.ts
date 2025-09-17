import { error, text } from '@sveltejs/kit';
import { GEMINI } from '$env/static/private';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
	edit_point,
	get
} from '$lib/db';
import type { Post } from '$lib/types';

export const POST = async ({ request, locals, params }) => {
	if (!locals.user) {
		throw error(401);
	}
	const instructions = await request.text();
	if (!instructions?.trim()) {
		throw error(400, 'edit instructions required');
	}
	const post = await get<Post>(params.i, ['u', 'h', 'txt']);
	if (!post) {
		throw error(404, 'resume not found');
	}
	if (post.u !== locals.user.i) {
		throw error(403, "you don't own this resume");
	}
	const genAI = new GoogleGenerativeAI(GEMINI);
	const model = genAI.getGenerativeModel({
		model: 'gemini-2.5-flash'
	});
	const prompt = `Edit the post according to the given instructions.Current post:\n \`\`\`markdown\n${post.b}\`\`\`. Edit according to these instructions: ${instructions}. Output only the markdown code`;
	const result = await model.generateContent(prompt);
	const response = await result.response;
	const b = response.text().trim();
	 await edit_point(params.i, {
		b,
		l: Date.now()
	});
	return text(b)
};
