import { error, redirect } from '@sveltejs/kit';
import { qdrant } from '$lib/db';
import type { PageServerLoad } from './$types';
import type { Resume } from '$lib/types';
import { collection } from '$lib/constants';

export const load: PageServerLoad = async ({
	locals
}: Parameters<PageServerLoad>[0]) => {
	if (!locals.user) {
		redirect(302, '/google?next=/resume/mine');
	}
	const resumes = await qdrant.search(collection, {
		vector: new Array(3072).fill(0),
		filter: { must: [{ key: 's', match: { value: 'e' } }] },
		with_payload: ['d', 'l', 'h', 'u'],
		limit: 100,
		with_vector: false
	});

	const ownerIds = new Set<string>();
	for (const point of resumes) {
		const owner = (point.payload as any)?.u;
		if (typeof owner === 'string') ownerIds.add(owner);
	}

	const owners: Record<string, string> = {};
	if (ownerIds.size) {
		const ownerResults = await qdrant.retrieve(collection, {
			ids: Array.from(ownerIds),
			with_payload: ['t']
		});
		for (const owner of ownerResults) {
			const payload = owner.payload as { t?: string } | undefined;
			if (payload?.t && typeof owner.id === 'string') {
				owners[owner.id] = payload.t;
			}
		}
	}

	return {
		e: resumes.map((point) => {
			const payload = point.payload as Partial<Resume>;
			const id = String(point.id);
			const ownerTag = owners[payload.u ?? ''];
			return {
				i: id,
				u: payload.u,
				d: payload.d,
				l: payload.l,
				h: payload.h,
				t: ownerTag
			};
		}),
		user: locals.user
	};
};
