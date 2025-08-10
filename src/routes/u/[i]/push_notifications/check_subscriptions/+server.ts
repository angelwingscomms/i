import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { get } from '$lib/db';
import type { User } from '$lib/types';

export const GET: RequestHandler = async ({ params, url }) => {
	const { i } = params;
	if (!i) return json({ error: 'missing user id' }, { status: 400 });
	const user = await get<User>(i);
	if (!user) return new Response('user not found', { status: 404 });

	const endpoint = url.searchParams.get('endpoint');
	if (!endpoint) return json({ subscribed: !!user.ps });

	const subscribed = !!user.ps && user.ps.endpoint === endpoint;
	return json({ subscribed });
};
