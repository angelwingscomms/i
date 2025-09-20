import { json, error } from '@sveltejs/kit';
import { GEMINI } from '$env/static/private';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { get } from '$lib/db';
import { update_post } from '$lib/db/post';
import type { Post } from '$lib/types';

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
			'Post ID and edit instructions required'
		);
	}
	const post = await get<Post>(i, [
		'u',
		't',
		'b',
		'y'
	]);
	if (!post) {
		throw error(404, 'Post not found');
	}
	if (post.s !== 'p') {
		throw error(400, 'This entity is not a post');
	}
	if (post.u !== locals.user.i) {
		throw error(403, "You don't own this post");
	}
	const genAI = new GoogleGenerativeAI(GEMINI);
	const model = genAI.getGenerativeModel({
		model: 'gemini-2.5-flash'
	});
	const prompt = `Edit the following post based on these instructions: "${instructions}". Current post title: "${post.t || ''}". Current post body: "${post.b || ''}". Output ONLY valid JSON in this exact format: {"t": "new title", "b": "new body (markdown)"}. Do not include any other text.`;
	const result = await model.generateContent(prompt);
	const response = await result.response;
	let new_content = response.text().trim();
	new_content = new_content
		.replace(/^```json\s*\n?/, '')
		.replace(/\n?```$/, '')
		.trim();
	const parsed = JSON.parse(new_content);
	const { t, b } = parsed;
	await update_post(i, {
		t: t || post.t,
		b: b || post.b,
		l: Date.now()
	});
	return json({
		t,
		b
	});
};