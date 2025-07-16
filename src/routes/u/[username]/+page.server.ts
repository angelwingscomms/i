import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const { username } = params;

	try {
		const response = await fetch(`/api/compare?user1=&user2=${username}`);
		if (!response.ok) {
			const errorData = await response.json();
			throw error(response.status, errorData.message || 'Failed to fetch comparison');
		}
		const commonalities = await response.json();
		return {
			username,
			commonalities
		};
	} catch (e: any) {
		throw error(e.status || 500, e.body?.message || 'An unexpected error occurred.');
	}
};
