import { GEMINI } from '$env/static/private';
import { GoogleGenAI } from '@google/genai/node';

export const embed = async (contents: string) => {
	const ai = new GoogleGenAI({ vertexai: false, apiKey: GEMINI });
	const response = await ai.models.embedContent({
		model: 'gemini-embedding-001',
		contents
	});
	if (response && response.embeddings && Array.isArray(response.embeddings.values)) {
		return response.embeddings['values'];
	}
};
