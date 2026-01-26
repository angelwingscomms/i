import { json, type RequestHandler } from '@sveltejs/kit';
import axios from 'axios';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { url } = (await request.json()) as { url: string };

		if (!url || typeof url !== 'string') {
			return json({ error: 'URL is required' }, { status: 400 });
		}

		// Basic URL validation
		try {
			new URL(url);
		} catch {
			return json({ error: 'Invalid URL format' }, { status: 400 });
		}

		// Parse the URL to get the origin
		const urlObj = new URL(url);
		const faviconUrl = `${urlObj.origin}/favicon.ico`;

		// Fetch the favicon with timeout
		const response = await axios.get(faviconUrl, {
			timeout: 5000,
			responseType: 'arraybuffer',
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
				'Accept': 'image/*',
				'Cache-Control': 'no-cache'
			}
		});

		// Check if response is successful and contains valid favicon data
		if (response.status === 200 && response.data) {
			const contentLength = response.headers['content-length'];
			const contentType = response.headers['content-type'];
			
			// Validate favicon: reasonable size and image content type
			if (contentLength && parseInt(contentLength) > 0 && parseInt(contentLength) < 50000) {
				if (contentType && contentType.startsWith('image/')) {
					return json({
						success: true,
						url: faviconUrl,
						contentType,
						size: parseInt(contentLength)
					});
				} else {
					return json({ error: 'Invalid content type' }, { status: 400 });
				}
			} else {
				return json({ error: 'Invalid favicon size' }, { status: 400 });
			}
		} else {
			return json({ error: `HTTP ${response.status}` }, { status: response.status });
		}

	} catch (error) {
		if (axios.isAxiosError(error)) {
			if (error.code === 'ECONNABORTED') {
				return json({ error: 'Request timeout' }, { status: 408 });
			} else if (error.response) {
				return json({ error: `HTTP ${error.response.status}` }, { status: error.response.status });
			} else {
				return json({ error: 'Network error' }, { status: 500 });
			}
		} else {
			return json({ error: 'Internal server error' }, { status: 500 });
		}
	}
};