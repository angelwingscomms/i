import { error } from '@sveltejs/kit';
import { create } from '$lib/db';
import type { Room } from '$lib/types';
import { realtime } from '$lib/util/realtime.js';

export async function createRoom({
	title,
	about,
	users,
	_,
	extra = {}
}: {
	title?: string;
	about?: string;
	users: string | string[];
	_: ',' | '.' | '-' | '|';
	extra?: object;
}) {
	const trimmedTitle = title
		? title.trim()
		: 'Untitled Room';
	const trimmedAbout = about ? about.trim() : '';

	let createMeetingRes;
	try {
		createMeetingRes = await realtime.post(
			'meetings',
			{ title: trimmedTitle }
		);
		if (
			!createMeetingRes ||
			createMeetingRes?.statusText === 'OK'
		)
			throw new Error('Failed to create meeting');
		console.log(
			'create_meeting_res',
			createMeetingRes
		);
	} catch (err) {
		console.error(
			'create cloudflare realtime meeting error: ',
			err
		);
		throw error(
			500,
			'Failed to create room due to an internal server error. Please try again.'
		);
	}

	const roomPayload: Omit<Room, 'i'> & { s: 'r' } = {
		s: 'r', // tenant ID for rooms
		t: trimmedTitle, // room tag
		a: trimmedAbout, // about room
		c: '',
		q: createMeetingRes.data.data.id,
		_: _,
		d: Date.now(), // creation timestamp
		...(extra && extra)
	};

	if (typeof users === 'string') {
		roomPayload.u = users;
	} else {
		roomPayload.x = users;
	}

	console.log('room_payload', roomPayload);

	try {
		const metadata: {
			room_name_or_tag: string;
			room_description: string;
			room_type: string;
			room_created_by?: string;
		} = {
			room_name_or_tag: roomPayload.t,
			room_description: roomPayload.a || '',
			room_type: 'public'
		};
		if (typeof users === 'string') {
			metadata.room_created_by = users;
		}
		const roomId = await create(
			roomPayload,
			JSON.stringify(metadata)
		);
		return roomId;
	} catch (e) {
		console.error(
			'Error creating room in database:',
			e
		);
		throw error(
			500,
			'Failed to create room due to an internal server error. Please try again.'
		);
	}
}
