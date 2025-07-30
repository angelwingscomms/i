import { GoogleGenAI } from '@google/genai';
import { json } from '@sveltejs/kit';

// In a SvelteKit app, for server-side environment variables,
// you would typically use: `import { GOOGLE_API_KEY } from '$env/static/private';`
// For this example, we'll assume process.env.GOOGLE_API_KEY is available.
const API_KEY = process.env.GOOGLE_API_KEY;

// Initialize genAI and the model outside of the POST handler for performance.
// This ensures they are set up once when the server starts.
let genAI: GoogleGenAI | undefined;
let model: ReturnType<GoogleGenAI['getGenerativeModel']> | undefined;

if (!API_KEY) {
    console.error('ERROR: GOOGLE_API_KEY environment variable is not set.');
    console.error('Token counting will not be available. Please set this variable.');
    // In a production app, you might throw an error here to prevent the server from starting
    // if this functionality is critical.
} else {
    genAI = new GoogleGenAI();
    // The 'gemini-pro' model is suitable for text-only tasks like token counting.
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
}

export const POST = async ({ request }) => {
    // If the API key was not set, return an error immediately.
    if (!genAI || !model) {
        return json({ error: 'Server not configured for token counting (API key missing).' }, { status: 500 });
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
        return json({ error: 'Failed to count tokens due to an internal server error.' }, { status: 500 });
    }
};