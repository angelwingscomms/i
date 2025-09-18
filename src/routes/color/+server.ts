import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserColors, edit_point } from '$lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI } from '$env/static/private';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}
	const user_i = locals.user.i;
	const colors = await getUserColors(user_i);
	return json(colors);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}
	const user_i = locals.user.i;
	const data = await request.json();
	const { d } = data;
	let colors;
	if (d) {
		try {
			const genAI = new GoogleGenerativeAI(GEMINI);
			const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
			const prompt = `Generate 5 distinct 6-digit hex color codes (without #) inspired by this user description: ${d}. Return only the hex codes, without hashes, as a JSON array. e.g. ["000000", "333333", "666666", "999999", "cccccc"]`;
			const result = await model.generateContent(prompt);
			const response = await result.response;
			const text = response.text();
			colors = JSON.parse(text);
			
			// Validate the AI response
			const hexRegex = /^([0-9a-fA-F]{6})$/;
			if (!Array.isArray(colors) || colors.length !== 5 || !colors.every(c => hexRegex.test(c))) {
				throw new Error('Invalid AI response format');
			}
		} catch (e) {
			console.error('AI color generation failed:', e);
			colors = generateRandomColors(5); // Fallback
		}
	} else {
		colors = generateRandomColors(5);
	}
	await edit_point(user_i, { c: colors });
	return json({ c: colors });
};

function generateRandomColors(n: number) {
	// Simple random hex generator
	return Array.from({length: n}, () => Math.floor(Math.random()*16777215).toString(16).padStart(6,'0'));
}

export const PUT: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}
	const user_i = locals.user.i;
	const data = await request.json();
	const { c } = data;
	if (!Array.isArray(c) || c.length === 0 || c.length > 20) {
		throw error(400, 'Must provide an array of 1-20 colors');
	}
	const hexRegex = /^([0-9a-fA-F]{6})$/;
	for (const color of c) {
		if (typeof color !== 'string' || !hexRegex.test(color)) {
			throw error(400, 'Each color must be a valid 6-digit hex code without #');
		}
	}
	const normalizedColors = c.map((col) => col.toLowerCase());
	await edit_point(user_i, { c: normalizedColors });
	return json({ success: true, c: normalizedColors });
};
