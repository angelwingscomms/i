import { error, json, type RequestHandler } from '@sveltejs/kit';
import { get, searchByVector } from '$lib/db';
import type { User } from '$lib/types';
import axios from 'axios';
import { GoogleGenAI } from '@google/genai';
import { embed } from '$lib/util/embed';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user?.i) {
		return json({ error: 'requires logged in user' }, { status: 401 });
	}

	try {
		const {
			g: genderFilter,
			n: ageMin,
			x: ageMax,
			d: description
		} = (await request.json()) as { g: number; n: number; x: number };

		// Validate inputs
		if (typeof ageMin !== 'number' || typeof ageMax !== 'number' || ageMin > ageMax) {
			return json({ error: 'Invalid age range' }, { status: 400 });
		}

		if (genderFilter !== null && genderFilter !== 0 && genderFilter !== 1) {
			return json({ error: 'Invalid gender filter' }, { status: 400 });
		}

		let vector: number[];

		if (description) {
			vector = await embed(description);
		} else {
			({ vector } = (await get(locals.user.i, undefined, true)) as { vector: number[] });
		}

		// Build filters for Qdrant search
		const filter: Record<string, unknown> = {
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
			filter.must.push({
				key: 'g',
				match: { value: genderFilter }
			});
		}

		// Search for similar users using vector search
		// console.log('--filters', filters)
		const searchResults = await searchByVector<User>({
			vector,
			filter,
			with_payload: ['t', 'a', 'g']
		});

		return json(searchResults);
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