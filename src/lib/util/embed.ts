import { GEMINI } from '$env/static/private';
import { GoogleGenAI } from '@google/genai';

export const embed = async (contents: string): Promise<number[]> => {
	const ai = new GoogleGenAI({});
	const embeddings = (
		await ai.models.embedContent({
			model: 'gemini-embedding-001',
			contents
		})
	).embeddings;
	if (embeddings && embeddings[0].values) {
		return embeddings[0].values;
	} else {
		throw 'error getting embeddings';
	}
};

