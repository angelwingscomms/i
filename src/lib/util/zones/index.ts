import { find_zone_by_place, create_zone } from '$lib/db/zone';
import { search_openstreetmap } from '$lib/integrations/openstreetmap';

export const create_zone_by_place_id = async (
	place_id: string,
	user_id: string
) => {
	const trimmed_place = place_id?.trim();
	const trimmed_user = user_id?.trim();
	if (!trimmed_place || !trimmed_user) {
		throw new Error('invalid zone request');
	}

	const existing = await find_zone_by_place(trimmed_place);
	if (existing) return existing;

	const matches = await search_openstreetmap(trimmed_place, 1);
	const place = matches.find((p) => p.i === trimmed_place) ?? matches[0];

	if (!place) {
		throw new Error('zone not found');
	}

	const id = await create_zone(
		trimmed_user,
		{
			n: place.n,
			l: place.l,
			g: place.g,
			p: place.p
		},
		place.p
	);

	return {
		s: 'z' as const,
		i: id,
		p: place.p,
		n: place.n,
		l: place.l,
		g: place.g
	};
};
