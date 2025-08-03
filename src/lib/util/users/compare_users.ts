import { GEMINI as key } from "$env/static/private";
import type { User } from "$lib/types";
import axios from "axios";

export const compare_users = async (self: Partial<User>, user: Partial<User>) => {
  if (!self.d || ! user.d) return
  try {
				const response = await axios.post(
					'https://generativelanguage.googleapis.com/v1beta/models/gemma-3n-e4b-it:generateContent',
					{
						contents: [
							{
								parts: [
									{
										text: `Compare these two user descriptions and identify their commonalities. Focus on shared interests, values, personality traits, and goals. Return only the commonalities in a concise, friendly format.

${self.t}: "${self.d}"

${user.t}: "${user.d}"

Please detail what these users have in common, or overlaps between them, or patterns they share, formatted as a friendly paragraph. Refer to ${auth_user.t} as 'you'. Don't greet at the beginnning of your response. be casual and concise, yet detailed`
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
							key
						}
					}
				);

				comparisonResult = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
			} catch (comparisonError) {
				console.error('Comparison error:', comparisonError);
				// Continue without comparison if it fails
			}
}