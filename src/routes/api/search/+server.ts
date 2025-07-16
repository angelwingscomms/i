import { json, type RequestHandler } from '@sveltejs/kit';
import { searchByVector } from '$lib/db';
import type { User } from '$lib/types';
import axios from 'axios';
import { GEMINI_API_KEY } from '$env/static/private';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const { genderFilter, ageMin, ageMax } = await request.json();

		// Validate inputs
		if (typeof ageMin !== 'number' || typeof ageMax !== 'number' || ageMin > ageMax) {
			return json({ error: 'Invalid age range' }, { status: 400 });
		}

		if (genderFilter !== null && genderFilter !== 0 && genderFilter !== 1) {
			return json({ error: 'Invalid gender filter' }, { status: 400 });
		}

		// Generate embedding from current user's description
		const embeddingResponse = await axios.post(
			'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent',
			{
				model: 'models/text-embedding-004',
				content: {
					parts: [{ text: locals.user.d || '' }]
				}
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

		const embedding = embeddingResponse.data.embedding.values;

		// Build filters for Qdrant search
		const filters: Record<string, unknown> = {
			must: [
				{
					key: 's',
					match: { value: 'u' }
				},
				{
					key: 'a',
					range: {
						gte: ageMin,
						lte: ageMax
					}
				}
			],
			must_not: [
				{
					key: 'i',
					match: { value: locals.user.i }
				}
			]
		};

		// Add gender filter if specified
		if (genderFilter !== null) {
			filters.must.push({
				key: 'g',
				match: { value: genderFilter }
			});
		}

		// Search for similar users using vector search
		const searchResults = await searchByVector<User>(embedding, 20, filters);

		return json({
			users: searchResults,
			count: searchResults.length
		});
	} catch (error) {
		console.error('Search API error:', error);

		if (axios.isAxiosError(error)) {
			return json(
				{ error: 'Failed to generate embedding', details: error.message },
				{ status: 500 }
			);
		}

		return json(
			{ error: 'Search failed', details: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};
