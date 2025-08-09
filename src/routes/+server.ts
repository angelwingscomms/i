import { json, type RequestHandler } from '@sveltejs/kit';
import { get, search_by_vector } from '$lib/db';
import type { User } from '$lib/types';
import axios from 'axios';
import { embed } from '$lib/util/embed';

export const POST: RequestHandler = async ({ request, locals }) => {
	// const utd = await qdrant.scroll(collection, { filter: { must: { is_null: { key: 'p' } } } });
	// console.log('utd', utd);
	//  await qdrant.delete('i', { points: utd.points.map(p => p.id)})

	try {
		const {
			g: genderFilter,
			n: ageMin,
			x: ageMax,
			d: description
		} = (await request.json()) as { g: number; n: number; x: number; d: string };

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
			const me = await get<{ vector: number[] }>(locals.user?.i as string, undefined, true);
			if (!me || !me.vector) {
				return json({ error: 'User vector not found' }, { status: 400 });
			}
			vector = me.vector;
		}

		// Build filters for Qdrant search
		const filter: { must: Record<string, unknown>; must_not?: Record<string, unknown> } = {
			must: {
				s: 'u',
				a: {
					range: {
						gte: ageMin,
						lte: ageMax
					}
				}
			}
		};

		// Add gender filter if specified
		if (genderFilter !== null) {
			(filter.must as Record<string, unknown>).g = genderFilter;
		}

		// Exclude current user if present
		if (locals.user?.i) {
			filter.must_not = { i: locals.user.i };
		}

		// Search for similar users using vector search
		// console.log('--filters', filters)
        const searchResults = await search_by_vector<User>({
			vector,
			filter,
            with_payload: ['t', 'a', 'g', 'av']
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
