import { GoogleGenAI } from '@google/genai';
import { json } from '@sveltejs/kit';

// In a SvelteKit app, for server-side environment variables,
// you would typically use: `import { GOOGLE_API_KEY } from '$env/static/private';`
import { GOOGLE_API_KEY } from '$env/static/private';
const API_KEY = GOOGLE_API_KEY;

// Initialize genAI and the model outside of the POST handler for performance.
// This ensures they are set up once when the server starts.
let genAI: GoogleGenAI | undefined;
let model: ReturnType<GoogleGenAI['getGenerativeModel']> | undefined;

console.log('GOOGLE_API_KEY:', GOOGLE_API_KEY ? 'SET' : 'NOT SET'); // Log API key status

if (GOOGLE_API_KEY) {
	try {
		genAI = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
		console.log('genAI initialized:', genAI);
		model = genAI.getGenerativeModel({ model: 'gemini-pro' });
	} catch (e) {
		console.error('Error initializing GoogleGenAI or model:', e);
		genAI = undefined;
		model = undefined;
	}
} else {
	console.error('ERROR: GOOGLE_API_KEY environment variable is not set. Token counting will not be available.');
}

export const POST = async ({ request }) => {
	// If the API key was not set, return an error immediately.
	if (!genAI || !model) {
		return json(
			{ error: 'Server not configured for token counting (API key missing).' },
			{ status: 500 }
		);
	}

	try {
		const { text } = await request.json();

		if (typeof text !== 'string') {
			return json({ error: 'Invalid input: "text" must be a string.' }, { status: 400 });
		}

		// Count tokens using the Google GenAI model's countTokens method.
		const { totalTokens } = await model.countTokens(text);

		// Return the token count as a JSON response.
		return json({ tokenCount: totalTokens });
	} catch (error) {
		console.error('Error counting tokens:', error);
		// Return a generic error message to the client for security and robustness.
		return json(
			{ error: 'Failed to count tokens due to an internal server error.' },
			{ status: 500 }
		);
	}
};
