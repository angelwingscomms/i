import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get } from '$lib/db';
import type { User } from '$lib/types';
import axios from 'axios';
import { GEMINI_API_KEY } from '$env/static/private';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { id } = params;

	try {
		// Get the user by ID
		const user = await get<User>(id);

		if (!user) {
			throw error(404, 'User not found');
		}

		// Basic user info to return
		const userInfo = {
			tag: user.t,
			age: user.a,
			gender: user.g,
			description: user.d
		};

		// If current user is logged in, compare descriptions
		let comparisonResult = null;
		if (locals.user?.i && locals.user.i !== user.i) {
		const auth_user = await get(locals.user.i, ['d', 't']) as {d: string, t: string}
			try {
				const response = await axios.post(
					'https://generativelanguage.googleapis.com/v1beta/models/gemma-3n-e4b-it:generateContent',
					{
						contents: [
							{
								parts: [
									{
										text: `Compare these two user descriptions and identify their commonalities. Focus on shared interests, values, personality traits, and goals. Return only the commonalities in a concise, friendly format.

${auth_user.t}: "${auth_user.d}"

${user.t}: "${user.d}"

Please detail what these users have in common, or overlaps between them, or patterns they share, formatted as a friendly paragraph. Refer to ${auth_user.t} as 'you'`
									}
								]
							}
						]
					},
					{
						headers: {
							'Content-Type': 'application/json'
						},
						params: {
							key: GEMINI_API_KEY
						}
					}
				);

				comparisonResult = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
			} catch (comparisonError) {
				console.error('Comparison error:', comparisonError);
				// Continue without comparison if it fails
			}
		}
		
		// console.log('comparisonResult', comparisonResult)

		return {
			user: userInfo,
			comparison: comparisonResult,
			isLoggedIn: !!locals.user,
			isOwnProfile: locals.user?.i === user.i
		};
	} catch (err) {
		console.error('Error loading user:', err);
		throw error(500, 'Failed to load user');
	}
};
