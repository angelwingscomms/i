import { get, new_id, search_by_payload } from '$lib/db';
import type { User } from '$lib/types';
import { realtime } from '$lib/util/realtime';

export const load = async ({ params, parent, locals }) => {
    const user = await parent();
    const realtime_res = await realtime.post(
        'meetings/' + user.q + '/participants',
        {
            name: locals.user?.t || 'Anonymous',
            // picture: locals.user?.p || '',
            preset_name: 'group_call_participant',
            custom_participant_id:
                locals.user?.i || new_id()
        }
    );
    return { q: realtime_res.data.data.token };
};
