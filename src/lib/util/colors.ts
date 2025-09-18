import { get, edit_point } from '$lib/db';
import { GEMINI } from '$env/static/private';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { User } from '$lib/types';

export async function generateColorPalette(
	user_i: string
): Promise<string[]> {
	const user = await get<{ d?: string }>(user_i, 'd');
	if (!user?.d) {
		return [
			'000000',
			'333333',
			'666666',
			'999999',
			'cccccc'
		]; // neutral default
	}

	const genAI = new GoogleGenerativeAI(GEMINI);
	const model = genAI.getGenerativeModel({
		model: 'gemini-1.5-flash'
	});

	const schema = {
		type: 'array',
		items: { type: 'string' },
		maxItems: 5,
		minItems: 5
	} as const;

	const generationConfig = {
		generationConfig: {
			responseMimeType: 'application/json',
			responseSchema: schema
		}
	};

	const prompt = `Based on this user description: "${user.d}", generate a professional 5-color palette suitable for a resume or profile. Each color is a 6-digit hex code WITHOUT the # prefix. Ensure they are distinct and harmonious. Output ONLY the JSON array of 5 strings.`;

	const result = await model.generateContent({
		contents: [
			{ role: 'user', parts: [{ text: prompt }] }
		],
		...generationConfig
	});

	const response = await result.response;
	const text = response.text().trim();
	let colors: string[];
	try {
		colors = JSON.parse(text);
	} catch {
		throw new Error('Failed to parse color palette');
	}

	// Validate and normalize
	colors = colors.slice(0, 5).map((c) => {
		c = (c || '').replace('#', '').toLowerCase();
		if (!/^([0-9a-f]{6})$/.test(c)) {
			throw new Error('Invalid hex color generated');
		}
		return c;
	});

	while (colors.length < 5) {
		colors.push('000000');
	}

	return colors;
}

export async function getUserColors(
	user_i: string
): Promise<string[]> {
	const user = await get<{ c?: string[] }>(
		user_i,
		'c'
	);
	if (
		user?.c &&
		Array.isArray(user.c) &&
		user.c.length === 5
	) {
		return user.c;
	}
	const colors = await generateColorPalette(user_i);
	await edit_point(user_i, { c: colors });
	return colors;
}
