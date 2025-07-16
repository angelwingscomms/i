import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getByPayload } from '$lib/db';
import type { User } from '$lib/types';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '$env/static/private';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

async function run(user1_text: string, user2_text: string) {
	const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

	const prompt = `Based on the two descriptions below, identify and list the top 3-5 most specific and interesting commonalities. Focus on shared niche interests, unique personality traits, or specific life experiences. Avoid generic statements like "they both like music" and instead favor concrete details.

  User 1:
  "${user1_text}"

  User 2:
  "${user2_text}"

  Commonalities:`;

	const result = await model.generateContent(prompt);
	const response = await result.response;
	const text = response.text();
	return text.split('\\n').map((s) => s.trim());
}

export const GET: RequestHandler = async ({ url, locals }) => {
	const user2_username = url.searchParams.get('user2');

	if (!user2_username) {
		throw error(400, 'Username for user2 is required');
	}

	const { user: authUser } = await locals.auth.validateUser();
	if (!authUser) {
		throw error(401, 'Not logged in');
	}

	try {
		const user1 = await getByPayload<User>({ g: authUser.googleId });
		const user2 = await getByPayload<User>({ u: user2_username });

		if (!user1 || !user2) {
			throw error(404, 'One or both users not found');
		}

		const commonalities = await run(user1.t, user2.t);
		return json(commonalities);
	} catch (e: any) {
		console.error(e);
		throw error(e.status || 500, e.body?.message || 'Failed to compare users');
	}
};
