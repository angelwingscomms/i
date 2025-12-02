import { error, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { get } from '$lib/db';
import type { Item } from '$lib/types/item';
import { collection } from '$lib/constants';

export const DELETE: RequestHandler = async ({
    params,
    locals
}) => {
    if (!locals.user) {
        return error(401, 'Unauthorized');
    }

    const { i } = params;
    if (!i) return error(400, 'Missing item id');

    const item = await get<Item>(i);
    if (
        !item ||
        item.s !== 'i' ||
        locals.user.i !== item.u
    ) {
        return error(403, 'Unauthorized');
    }

    const qdrant = (await import('$lib/db')).qdrant;
    await qdrant.delete(collection, {
        points: [i]
    });

    throw redirect(303, '/find');
};