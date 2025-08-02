export const get_user = async () => {
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