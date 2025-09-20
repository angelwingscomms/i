import { error, text } from '@sveltejs/kit';
import { createRoom } from '$lib/room/create';

export async function POST({ request, locals }) {
	if (!locals.user || !locals.user.i) {
		throw error(401, 'Unauthorized');
	}

	const { t, a } = await request.json();

	const roomId = await createRoom({ title: t, about: a, users: locals.user.i, _ : '.' });

	return text(roomId);
}
