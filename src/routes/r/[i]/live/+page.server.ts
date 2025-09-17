import { get } from '$lib/db';
import { realtime } from '$lib/util/realtime';
import { v7 } from 'uuid';

export const load = async ({ params, locals }) => {
	const q = await get(params.i, 'q');
	const realtime_res = await realtime.post('meetings/' + q + '/participants', {
		name: locals.user?.t || 'Anonymous',
		// picture: locals.user?.p || '',
		preset_name: 'group_call_participant',
		custom_participant_id: locals.user?.i || v7()
	});
	return { q: realtime_res.data.data.token };
};
