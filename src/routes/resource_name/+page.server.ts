import type { PageServerLoad } from './$types';
import { qdrant } from '$lib/db';
import { embed } from '$lib/util/embed';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI } from '$env/static/private';
import { error } from 'console';

type SearchResource = {
	i: string;
	n?: string;
	b?: string;
	p?: string[];
	a?: string;
	score?: number;
};

export const load: PageServerLoad = async ({
	locals
}) => {
	const user = locals.user;

	let results: SearchResource[] = [];

	try {
		if (user && user.a) {
			const genAI = new GoogleGenerativeAI(GEMINI);
			const model = genAI.getGenerativeModel({
				model: 'gemini-2.5-flash'
			});
			const prompt = `Describe products that would interest someone with this description: ${user.a}`;
			const result =
				await model.generateContent(prompt);
			const response = await result.response;
			const description = response.text().trim();
			const vector = await embed(description);
			results =
				(
					await qdrant.search('i', {
						vector,
						filter: {
							must: [
								{ key: 's', match: { value: 'r' } }
							],
							must_not: {
								is_null: { key: 'n' }
							}
						},
						with_payload: ['n', 'b', 'p', 'a'],
						limit: 54
					})
				).map((p: any) => ({
					i: p.id as string,
					...p.payload,
					score: p.score
				})) || [];
		} else {
			const scrollResults =
				(
					await qdrant.scroll('i', {
						filter: {
							must: [
								{
									key: 's',
									match: { value: 'resource' }
								}
							],
							must_not: {
								is_null: { key: 'n' }
							}
						},
						with_payload: ['n', 'b', 'p', 'a'],
						limit: 54,
						order_by: { key: 'd', direction: 'desc' }
					})
				).points.map((p: any) => ({
					i: p.id as string,
					...p.payload
				})) || [];
		}
	} catch (e) {
		error(500, 'an error occured searching for resources')
		console.error('resources qdrant error', e);
		results = [];
	}

	return { r: results };
};
