import { search_zones } from '$lib/db/zone';

export const load = async () => {
	return {
		z: await search_zones()
	};
};