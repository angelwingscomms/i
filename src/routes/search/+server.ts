import { error, json, type RequestHandler } from '@sveltejs/kit';
import { get, searchByVector } from '$lib/db';
import type { User } from '$lib/types';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user?.i) {
		return json({ error: 'requires logged in user' }, { status: 401 });
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
		
		const {vector} = await get(locals.user.i, undefined, true)

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
			]
			// must_not: [
			// 	{
			// 		key: 'i',
			// 		match: { value: locals.user.i }
			// 	}
			// ]
		};

		// Add gender filter if specified
		if (genderFilter !== null) {
			filters.must.push({
				key: 'g',
				match: { value: genderFilter }
			});
		}

		// Search for similar users using vector search
		// console.log('--filters', filters)
		const searchResults = await searchByVector<User>(vector, 20, filters);

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
