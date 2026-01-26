import axios from 'axios';

export interface FaviconResult {
	success: boolean;
	url?: string;
	error?: string;
}

/**
 * Fetch favicon from a given URL's origin
 * @param url The URL to fetch favicon from
 * @param timeoutMs Timeout in milliseconds (default: 5000)
 * @returns Promise resolving to FaviconResult
 */
export async function fetchFavicon(
	url: string,
	timeoutMs: number = 5000
): Promise<FaviconResult> {
	try {
		// Parse the URL to get the origin
		const urlObj = new URL(url);
		const faviconUrl = `${urlObj.origin}/favicon.ico`;

		// Create a timeout promise
		const timeoutPromise = new Promise<never>((_, reject) => {
			setTimeout(() => reject(new Error('Request timeout')), timeoutMs);
		});

		// Create the fetch promise
		const fetchPromise = axios.get(faviconUrl, {
			timeout: timeoutMs,
			responseType: 'arraybuffer',
			headers: {
				'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
			}
		});

		// Race between the fetch and timeout
		const response = await Promise.race([fetchPromise, timeoutPromise]);

		// Check if the response is successful and contains valid favicon data
		if (response.status === 200 && response.data) {
			// Check if the response is a valid favicon (typically small file size)
			const contentLength = response.headers['content-length'];
			if (contentLength && parseInt(contentLength) > 0 && parseInt(contentLength) < 50000) {
				return {
					success: true,
					url: faviconUrl
				};
			} else {
				return {
					success: false,
					error: 'Invalid favicon size'
				};
			}
		} else {
			return {
				success: false,
				error: `HTTP ${response.status}`
			};
		}
	} catch (error) {
		if (axios.isAxiosError(error)) {
			if (error.code === 'ECONNABORTED') {
				return {
					success: false,
					error: 'Request timeout'
				};
			} else if (error.response) {
				return {
					success: false,
					error: `HTTP ${error.response.status}`
				};
			} else {
				return {
					success: false,
					error: 'Network error'
				};
			}
		} else {
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error'
			};
		}
	}
}

/**
 * Extract domain from URL for fallback icon display
 * @param url The URL to extract domain from
 * @returns Domain hostname or empty string if invalid
 */
export function getDomainFromUrl(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return '';
	}
}

/**
 * Get platform-specific icon class based on URL
 * @param url The URL to check platform for
 * @returns Font Awesome icon class or null if unknown platform
 */
export function getPlatformIcon(url: string): string | null {
	try {
		const hostname = new URL(url).hostname;
		if (hostname.includes('facebook.com')) return 'fa-facebook';
		if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'fa-x-twitter';
		if (hostname.includes('instagram.com')) return 'fa-instagram';
		if (hostname.includes('linkedin.com')) return 'fa-linkedin';
		if (hostname.includes('github.com')) return 'fa-github';
		if (hostname.includes('youtube.com')) return 'fa-youtube';
		if (hostname.includes('tiktok.com')) return 'fa-tiktok';
		if (hostname.includes('discord.gg')) return 'fa-discord';
		if (hostname.includes('twitch.tv')) return 'fa-twitch';
		if (hostname.includes('reddit.com')) return 'fa-reddit';
		if (hostname.includes('pinterest.com')) return 'fa-pinterest';
		if (hostname.includes('snapchat.com')) return 'fa-snapchat';
		if (hostname.includes('telegram.org')) return 'fa-telegram';
		if (hostname.includes('whatsapp.com')) return 'fa-whatsapp';
		if (hostname.includes('signal.org')) return 'fa-signal';
		return null;
	} catch {
		return null;
	}
}