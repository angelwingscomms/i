import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import axios from 'axios';
import { env } from '$env/dynamic/private';

interface SearchBody {
	q: string;
	order?: 'date' | 'rating' | 'relevance' | 'title' | 'videoCount' | 'viewCount';
	publishedAfter?: string; // ISO date string
	videoDuration?: 'any' | 'short' | 'medium' | 'long';
	regionCode?: string;
	maxResults?: number;
}

export const POST: RequestHandler = async ({ request }) => {
	if (!env.YOUTUBE_API_KEY) throw error(500, 'Missing YOUTUBE_API_KEY');

	const {
		q,
		order = 'relevance',
		publishedAfter,
		videoDuration = 'any',
		regionCode = 'US',
		maxResults = 12
	} = (await request.json()) as SearchBody;

	if (!q || !q.trim()) throw error(400, 'q is required');

	try {
		// 1) Search for videos to get IDs
		const searchRes = await axios.get('https://www.googleapis.com/youtube/v3/search', {
			params: {
				key: env.YOUTUBE_API_KEY,
				q: q.trim(),
				type: 'video',
				part: 'snippet',
				maxResults: Math.min(Math.max(maxResults, 1), 25),
				order,
				...(publishedAfter ? { publishedAfter } : {}),
				...(videoDuration !== 'any' ? { videoDuration } : {}),
				regionCode
			}
		});

		const items: any[] = searchRes.data?.items || [];
		const ids = items.map((it) => it.id?.videoId).filter(Boolean);

		if (ids.length === 0) return json([]);

		// 2) Fetch statistics (viewCount) and details
		const videosRes = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
			params: {
				key: env.YOUTUBE_API_KEY,
				id: ids.join(','),
				part: 'snippet,statistics,contentDetails'
			}
		});

		const details: any[] = videosRes.data?.items || [];
		const detailsById: Record<string, any> = Object.fromEntries(details.map((d) => [d.id, d]));

		const results = ids
			.map((id: string) => {
				const sItem = items.find((x) => x.id.videoId === id);
				const dItem = detailsById[id];
				const snippet = dItem?.snippet || sItem?.snippet;
				return {
					id,
					title: snippet?.title || '',
					description: snippet?.description || '',
					publishedAt: snippet?.publishedAt || sItem?.snippet?.publishedAt,
					thumbnail: snippet?.thumbnails?.medium?.url || snippet?.thumbnails?.default?.url || '',
					viewCount: Number(dItem?.statistics?.viewCount || 0),
					url: `https://www.youtube.com/watch?v=${id}`
				};
			})
			.filter((x) => x.title);

		return json(results);
	} catch (e) {
		console.error('YouTube search error', e);
		throw error(502, 'Failed to search YouTube');
	}
};
