import { GEMINI } from "$env/dynamic/private";
import { GoogleGenAI } from "@google/genai/node";

export const embed = async () => {
  const ai = new GoogleGenAI({vertexai: false, apiKey: GEMINI});
		const response = await ai.models.embedContent({
			model: 'gemini-embedding-001',
			contents: embed,
		});
		if (response && response.embeddings && Array.isArray(response.embeddings.values)) {
			vector = response.embeddings["values"];
			console.log('res vector', vector)
		}
}