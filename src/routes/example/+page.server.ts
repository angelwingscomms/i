import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { search_by_payload, format_filter } from '$lib/db';
import type { Room, Message, LocalsUser } from '$lib/types';

// Rule: always get all data for a page in +page.server.ts load; bubble user via +layout.server.ts (assuming user bubbled here)
export const load: PageServerLoad = async ({ locals }: { locals: { user?: LocalsUser } }) => {
	// Rule: auth: user in locals.user { i, t }; sessions via httpOnly cookie
	if (!locals.user) {
		// Rule: in server files, use error(status, message) from @sveltejs/kit
		throw error(401, 'Unauthorized');
	}

	// Rule: always include s field in db queries/filters; omit null/undefined/'' in filters
	const rooms_filter = format_filter({ s: 'r' }); // Fetch all rooms (demo: no user-specific filter for simplicity)
	const rooms = await search_by_payload<Room>(rooms_filter);

	const messages_filter = format_filter({ s: 'm', u: locals.user.i }); // Messages for current user
	const messages = await search_by_payload<Message>(messages_filter);

	// Rule: export a typed load function returning { rooms: Room[], messages: Message[] }
	return {
		rooms,
		messages
	};
};