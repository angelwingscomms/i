import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { search_by_payload } from '$lib/db';
import type { Message } from '$lib/types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const { r } = (await request.json()) as { r: string };
	const last = (await search_by_payload<Message>({ s: 'm', r }, ['d', 'm', 'tc'], 1, { key: 'd', direction: 'desc' }))[0];
	const suggestion = last?.m ? `You could reply: "${last.m.slice(0, 64)}..."` : 'Say hello 👋';
	return json({ s: suggestion });
};

