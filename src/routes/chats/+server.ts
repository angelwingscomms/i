import { json, error } from '@sveltejs/kit';
import { get, search_by_payload } from '$lib/db';
import type { Room } from '$lib/types';

export async function POST({ locals }) {
	if (!locals.user || !locals.user.i) {
		throw error(401, 'Unauthorized');
	}

	const userId = locals.user.i;

	const userRooms: string[] = (await get(userId, 'r')) || [];

	const [createdRooms, receivedRooms] = await Promise.all([
		search_by_payload<Pick<Room, 't' | 'l' | 'm'>>({ s: 'r', u: userId }, ['t', 'l', 'm'], 144),
		search_by_payload<Pick<Room, 't' | 'l' | 'm'>>({ s: 'r', r: userId }, ['t', 'l', 'm'], 144)
	]);

	const roomsById = new Map<string, { i: string; t: string; l?: number; m?: number }>();

	const membershipRooms = (
		await Promise.all(
			userRooms.map(async (roomId) => {
				const r = await get<Pick<Room, 't' | 'l' | 'm'>>(roomId, ['t', 'l', 'm']);
				return r ? { i: roomId, t: r.t, l: r.l, m: r.m } : null;
			})
		)
	).filter(Boolean) as { i: string; t: string; l?: number; m?: number }[];

	for (const r of membershipRooms) roomsById.set(r.i, r);
	for (const r of createdRooms)
		roomsById.set((r as unknown as { i: string }).i, {
			i: (r as unknown as { i: string }).i,
			t: r.t,
			l: r.l,
			m: r.m
		});
	for (const r of receivedRooms)
		roomsById.set((r as unknown as { i: string }).i, {
			i: (r as unknown as { i: string }).i,
			t: r.t,
			l: r.l,
			m: r.m
		});

	const result = Array.from(roomsById.values()).sort((a, b) => (b.l || 0) - (a.l || 0));

	return json(result);
}
