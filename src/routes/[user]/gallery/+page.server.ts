import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { find_user_by_tag, get } from '$lib/db';

export const load: PageServerLoad = async ({ locals, params, parent }) => {
    const {user} = await parent();
    const images = await get(user.i, ['g'])

    if (!images) {
        throw error(404, 'images not found');
    }

    return { i: images };
};