import { GOOGLE_API_KEY } from '$env/static/private';
import { GoogleGenAI } from '@google/genai';

// Server-only token count. Falls back to heuristic if API key/model unavailable.
export const token_count = async (t: string): Promise<number> => {
	if (!t) return 0;
	try {
		if (GOOGLE_API_KEY) {
			const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
			const model = ai.getGenerativeModel({ model: 'gemini-pro' });
			const { totalTokens } = await model.countTokens(t);
			return typeof totalTokens === 'number' ? totalTokens : heuristic(t);
		}
		return heuristic(t);
	} catch {
		return heuristic(t);
	}
};

const heuristic = (s: string): number => {
	// Rough tokenization heuristic similar to GPT-3.5: ~4 chars/token baseline
	// Count words, numbers, emojis, and punctuation chunks
	const words = s.trim().split(/\s+/).filter(Boolean).length;
	const chars = s.length;
	const emojis = (s.match(/\p{Emoji_Presentation}|\p{Emoji}\uFE0F/gu) || []).length;
	return Math.max(1, Math.round(chars / 4) + Math.round(words * 0.2) + Math.round(emojis * 0.5));
};

