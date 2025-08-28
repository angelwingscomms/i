import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { count, format_filter, qdrant, get } from '$lib/db';
import { collection } from '$lib/constants';
import type { User } from '$lib/types';
import { dev } from '$app/environment';

// Deletes all rooms that are not one-on-one ("|") or anon ("-")
export const GET: RequestHandler = async ({ locals }) => {
	if (!dev) {
		error(403);
	}
	const payloadFilter = { s: 'r', _: { in: { values: [',', '.'] } } } as const;
	const filter = format_filter(payloadFilter);

	const toDelete = await count(payloadFilter);

	await qdrant.delete(collection, {
		wait: true,
		filter
	});

	return json({ deleted: toDelete });
};
