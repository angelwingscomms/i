import { get, search_by_payload } from '$lib/db';
import { error, fail, redirect } from '@sveltejs/kit';
import {
	generate_character,
	generate_environment
} from '$lib/ai/world';
import { create_character } from '$lib/db/character';
import { create_environment } from '$lib/db/environment';
import type {
	World,
	Character,
	Environment
} from '$lib/types';
import type { PageServerLoad, Actions } from './$types';

const ensure_owner = (world: World, user_id?: string) => {
	if (!user_id) {
		throw redirect(302, '/login');
	}
	if (world.u !== user_id) {
		throw error(403, 'not authorized');
	}
};

const fetch_entities = async <T extends Record<string, unknown>>(
	filter: Record<string, unknown>
) => {
	try {
		return await search_by_payload<T>(
			filter,
			true,
			54,
			{ key: 'd', direction: 'desc' }
		);
	} catch (primary_error) {
		console.error('world fetch failed, falling back', primary_error);
		try {
			return await search_by_payload<T>(
				filter,
				true,
				54
			);
		} catch (fallback_error) {
			console.error('world fetch fallback failed', fallback_error);
			return [] as Array<T & { i: string }>;
		}
	}
};

export const load: PageServerLoad = async ({ params, locals }) => {
	const world = await get<World>(params.i);
	if (!world || world.s !== 'w') {
		throw error(404, 'world not found');
	}

	ensure_owner(world, locals.user?.i);
	const user_id = locals.user!.i;

	const characters = await fetch_entities<Character>({
		s: 'wc',
		w: params.i,
		u: user_id
	});

	const environments = await fetch_entities<Environment>({
		s: 'we',
		w: params.i,
		u: user_id
	});

	return {
		w: { ...world, i: params.i },
		c: characters,
		v: environments
	};
};

export const actions: Actions = {
	create_character: async ({ request, params, locals }) => {
		if (!locals.user) {
			return fail(401, { e: 'not authenticated' });
		}
		const world = await get<World>(params.i);
		if (!world || world.s !== 'w') {
			return fail(404, { e: 'world not found' });
		}
		if (world.u !== locals.user.i) {
			return fail(403, { e: 'not authorized' });
		}
		const form = await request.formData();
		const name = (form.get('n') as string | null)?.trim() || '';
		const about = (form.get('a') as string | null)?.trim() || '';
		const meta_raw = (form.get('j') as string | null) || '';
		if (!name) {
			return fail(400, { e: 'name required' });
		}
		let meta: Record<string, unknown> | undefined;
		if (meta_raw.trim()) {
			try {
				meta = JSON.parse(meta_raw);
			} catch (error) {
				return fail(400, { e: 'invalid json' });
			}
		}
		await create_character(locals.user.i, params.i, name, about, meta);
		return { ok: true };
	},
	generate_character: async ({ params, locals }) => {
		if (!locals.user) {
			return fail(401, { e: 'not authenticated' });
		}
		const world = await get<World>(params.i);
		if (!world || world.s !== 'w') {
			return fail(404, { e: 'world not found' });
		}
		if (world.u !== locals.user.i) {
			return fail(403, { e: 'not authorized' });
		}
		const existing = await search_by_payload<Character>(
			{ s: 'wc', w: params.i, u: locals.user.i },
			['n'],
			30
		);
		const names = existing
			.map((entry) => entry.n?.trim())
			.filter(Boolean) as string[];
		const generated = await generate_character(world.a || '', names);
		await create_character(
			locals.user.i,
			params.i,
			generated.name,
			generated.about,
			generated.meta
		);
		return { ok: true };
	},
	generate_environment: async ({ params, locals }) => {
		if (!locals.user) {
			return fail(401, { e: 'not authenticated' });
		}
		const world = await get<World>(params.i);
		if (!world || world.s !== 'w') {
			return fail(404, { e: 'world not found' });
		}
		if (world.u !== locals.user.i) {
			return fail(403, { e: 'not authorized' });
		}
		const existing = await search_by_payload<Environment>(
			{ s: 'we', w: params.i, u: locals.user.i },
			['n'],
			30
		);
		const names = existing
			.map((entry) => entry.n?.trim())
			.filter(Boolean) as string[];
		const generated = await generate_environment(world.a || '', names);
		await create_environment(
			locals.user.i,
			params.i,
			generated.name,
			generated.about,
			generated.meta
		);
		return { ok: true };
	}
};
