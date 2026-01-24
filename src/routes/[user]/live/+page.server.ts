import {
	new_id,
} from '$lib/db';
import { realtime } from '$lib/util/realtime';

export const load = async ({
	parent,
	locals
}) => {
	const { user } = await parent();
	const realtime_res = await realtime.post(
		'meetings/' + user.q + '/participants',
		{
			name: locals.user?.t || 'Anonymous',
			picture: user?.p || '',
			preset_name:
				user.i === locals.user?.i
					? 'livestream_host'
					: 'livestream_viewer',
			custom_participant_id:
				locals.user?.i || new_id()
		}
	);
	return { q: realtime_res.data.data.token };
};
