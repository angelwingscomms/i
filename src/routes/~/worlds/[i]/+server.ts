import { json } from '@sveltejs/kit';
import { get } from '$lib/db';
import { update_world } from '$lib/db/world';
import type { World } from '$lib/types';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({
	params,
	request,
	locals
}) => {
	if (!locals.user) {
		return json(
			{ e: 'not authenticated' },
			{ status: 401 }
		);
	}
	const world = await get<World>(params.i);
	if (!world || world.s !== 'w') {
		return json(
			{ e: 'world not found' },
			{ status: 404 }
		);
	}
	if (world.u !== locals.user.i) {
		return json(
			{ e: 'not authorized' },
			{ status: 403 }
		);
	}
	let payload: Record<string, unknown>;
	try {
		payload = (await request.json()) as Record<
			string,
			unknown
		>;
	} catch (error) {
		return json(
			{ e: 'invalid payload' },
			{ status: 400 }
		);
	}
	const name_input = payload.n;
	const about_input = payload.a;
	const meta_input = payload.j;
	const name =
		typeof name_input === 'string'
			? name_input.trim()
			: '';
	const about =
		typeof about_input === 'string'
			? about_input.trim()
			: '';
	if (!name) {
		return json(
			{ e: 'name required' },
			{ status: 400 }
		);
	}
	let meta: Record<string, unknown> | undefined;
	if (meta_input !== undefined) {
		if (
			meta_input === null ||
			Array.isArray(meta_input) ||
			typeof meta_input !== 'object'
		) {
			return json(
				{ e: 'invalid metadata' },
				{ status: 400 }
			);
		}
		meta = meta_input as Record<string, unknown>;
	}
	await update_world(params.i, {
		n: name,
		a: about,
		j: meta
	});
	return json({ ok: true });
};
