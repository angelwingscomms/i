import type { RequestHandler } from '@sveltejs/kit';
import { error, json } from '@sveltejs/kit';
import { count, format_filter, qdrant, get } from '$lib/db';
import { collection } from '$lib/constants';
import type { User } from '$lib/types';

// Deletes all rooms that are not one-on-one ("|") or anon ("-")
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user?.i) throw error(401, 'Unauthorized');
	const me = await get<User>(locals.user.i);
	if (!me?.isAdmin) throw error(403, 'Forbidden');

	const payloadFilter = { s: 'r', _: { in: { values: [',', '.'] } } } as const;
	const filter = format_filter(payloadFilter);

	const toDelete = await count(payloadFilter);

	await qdrant.delete(collection, {
		wait: true,
		filter
	});

	return json({ deleted: toDelete });
};


