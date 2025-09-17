import { error, json } from '@sveltejs/kit';
import { realtime } from '$lib/util/realtime';
import { get } from '$lib/db';
import type { Room } from '$lib/types';

export const GET = async ({ params, url, locals }: { params: { i: string }; url: URL; locals: { user: { i: string } } }) => {
	const recordingId = url.searchParams.get('i');
	if (!recordingId) {
		return json({ error: 'Missing recording id' }, { status: 400 });
	}

	// Basic security: check if user has access to the room
	const room = await get<Room>(params.i);
	if (!room) {
        throw error(404, 'Room not found');
	}

    if (room.s !== 'r') {
        throw error(400, 'thing with specified id is not a room');
    }

	try {
		const response = await realtime.get(`recordings/${recordingId}`);
		const download_url = response.data.download_url;
		return json({ download_url });
	} catch (e) {
		console.error('Failed to fetch recording download link:', e);
		return json({ error: 'Failed to get download link' }, { status: 500 });
	}
};