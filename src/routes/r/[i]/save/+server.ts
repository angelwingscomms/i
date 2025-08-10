import { json } from '@sveltejs/kit';
import { edit_point, get } from '$lib/db';
import type { User } from '$lib/types';

export async function POST({ params, locals }) {
    const room_id = params.i;
    const user_id = locals.user?.i;

    if (!room_id) {
        return json({ message: 'Missing room ID' }, { status: 400 });
    }

    if (!user_id) {
        return json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await get<User>(user_id, ['r']);

        if (!user) {
            return json({ message: 'User not found' }, { status: 404 });
        }

        if (!user.r?.includes(room_id)) {
            await edit_point(user_id, { r: [...(user.r || []), room_id] });
        }

        return json({ message: 'Room saved successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error saving room:', error);
        return json({ message: 'Internal server error' }, { status: 500 });
    }
}