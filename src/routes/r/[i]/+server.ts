import { create, get, set } from '$lib/db';
import type { RequestHandler } from './$types';
import type {
	DBChatMessage,
	SendChatMessage,
	Message,
	Room,
	User
} from '$lib/types';
import { upload_image } from '$lib/integrations/r2_storage';
import { process_message } from '$lib/util/chat/process_message';
import { error } from 'console';
import { realtime } from '$lib/util/realtime';
import { send_push_notif } from '$lib/util/send_push_notif';
import type { PushSubscription } from 'web-push';
import { notif_debug } from '$lib/util/notif_debug';
type R2Bucket = unknown;

export const POST: RequestHandler = async ({
	platform,
	request,
	params,
	locals
}) => {
	// Accept multipart/form-data (from Chat.svelte/ChatInput) with JSON fallback
	const contentType =
		request.headers.get('content-type') || '';
	let m: SendChatMessage;
	let fileUrls: string[] = [];

	if (contentType.includes('multipart/form-data')) {
		const formData = await request.formData();
		const messageText =
			(formData.get('m') as string) || '';
		const receiverTag =
			(formData.get('t') as string) || '';
		const messageId =
			(formData.get('i') as string) ||
			crypto.randomUUID();
		const anonymous = formData.get('a') as
			| string
			| null;

		const files = formData
			.getAll('files')
			.filter(
				(f): f is File =>
					f instanceof File && f.size > 0
			);
		// Narrow platform type for lint without leaking 'any'
		type PlatformWithR2 = { env?: { R2?: R2Bucket } };
		const p = platform as PlatformWithR2;
		if (files.length > 0 && p?.env?.R2) {
			for (const file of files) {
				try {
					const url = await upload_image(
						file,
						undefined,
						platform as unknown as {
							env: {
								R2: R2Bucket;
								[key: string]: unknown;
							};
						}
					);
					fileUrls.push(url);
				} catch (e) {
					console.error(
						'R2 upload error during message send:',
						e
					);
				}
			}
		}

		m = {
			m: messageText,
			t: receiverTag,
			_: formData.get('_') as string,
			d: Date.now(),
			i: messageId,
			...(anonymous ? { a: anonymous } : {}),
			...(fileUrls.length > 0 ? { f: fileUrls } : {})
		};
	} else {
		m = (await request.json()) as SendChatMessage;
		m.d = Date.now();
		fileUrls = m.f ?? [];
	}

	const base: Message = {
		m: m.m,
		d: m.d,
		i: m.i,
		_: m._,
		h: 0,
		t: m.t,
		r: params.i,
		s: 'm',
		...(m.a ? { a: m.a } : {}),
		...(fileUrls.length > 0 ? { f: fileUrls } : {}),
		...(locals.user ? { u: locals.user.i } : {})
	};
	const with_tc = await process_message(base);

	let create_meeting_res;

	try {
		create_meeting_res = await realtime.post(
			'meetings',
			{ title: m.t }
		);
		if (
			!create_meeting_res ||
			create_meeting_res?.statusText === 'OK'
		)
			throw new Error('Failed to create meeting');
		console.log(
			'create_meeting_res',
			create_meeting_res
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

	await create(
		{
			...(locals.user ? { u: locals.user.i } : {}),
			s: 'm',
			d: with_tc.d,
			m: with_tc.m,
			q: create_meeting_res.data.data.id,
			r: params.i,
			tc: with_tc.tc,
			...(fileUrls.length > 0 ? { f: fileUrls } : {})
		} satisfies DBChatMessage & {
			tc?: number;
			f?: string[];
		},
		JSON.stringify({
			...(locals.user
				? { sender: locals.user.t }
				: {}),
			sent_at: new Date(m.d).toLocaleString(
				undefined,
				{
					weekday: 'long',
					year: 'numeric',
					month: 'long',
					day: 'numeric',
					hour: '2-digit',
					minute: '2-digit',
					second: '2-digit'
				}
			),
			message_text: m.m,
			room_name_or_tag: m.t,
			...(fileUrls.length > 0
				? { files: fileUrls }
				: {})
		}),
		m.i
	);

	// platform.env.r.fetch('http://./send/' + m.c + (await s()), {
	// 	method: 'POST',
	// 	body: JSON.stringify({
	// 		i,
	// 		...(locals.user ? { x: locals.user.t } : {}),
	// 		m: m.m,
	// 		...(fileUrls.length > 0 ? { f: fileUrls } : {})
	// 	} satisfies ChatMessage)
	// });

	// Push notifications for private rooms (one-on-one: room._ === '|')
	try {
		notif_debug(`Push notify entry for room ${params.i}, message ${m.i}`);
		const room = await get<Room>(params.i);
		if (room) {
			notif_debug(`Room fetched for ${params.i}: _=${room._}, u=${room.u}, x=${JSON.stringify(room.x)}`);
		}
		if (room && room._ === '|') {
			notif_debug(`Private room detected for ${params.i}`);
			const ids = Array.isArray(room.x)
				? room.x
				: room.u
				? [room.u]
				: [];
			const recipients = ids.filter(
				(id) => id && id !== locals.user?.i
			);
			notif_debug(`Recipients for ${params.i}: ${recipients.join(', ')}`);
			if (recipients.length) {
				const pair_subs: { id: string; sub: PushSubscription }[] = [];
				const subs_by_user: Record<string, PushSubscription[]> = {};
				for (const id of recipients) {
					notif_debug(`Processing recipient ${id} for room ${params.i}`);
					const psVal = (await get<User['ps']>(id, 'ps')) || [];
					const list: PushSubscription[] = Array.isArray(psVal)
						? (psVal as PushSubscription[])
						: psVal
						? [psVal as unknown as PushSubscription]
						: [];
					notif_debug(`Raw ps list for ${id}: length=${list.length}`);
					const now = Date.now();
					const filtered = list.filter((s) => {
						const exp = (s as unknown as { expirationTime?: number }).expirationTime;
						return !(typeof exp === 'number' && exp > 0 && exp < now);
					});
					notif_debug(`Filtered non-expired for ${id}: ${filtered.length}/${list.length}`);
					if (filtered.length !== list.length) {
						notif_debug(`Pruning expired subs for ${id}`);
						await set(id, { ps: filtered.length ? filtered : null });
					}
					subs_by_user[id] = filtered;
					for (const sub of filtered) pair_subs.push({ id, sub });
				}
				notif_debug(`Total pair_subs: ${pair_subs.length}`);
				if (pair_subs.length) {
					const sender_name = locals.user?.t || 'someone';
					const notificationPayload = {
						title: m.a ? 'New message' : `Message from ${sender_name}`,
						body: m.m,
						tag: `room-${params.i}`,
						icon: '/icons/icon-192.png',
						data: {
							roomId: params.i,
							url: `/r/${params.i}?message=${m.i}`,
							type: 'room_message'
						},
						vibrate: [200, 100, 200]
					};
					notif_debug(`Payload for room ${params.i}: title="${notificationPayload.title}", body="${notificationPayload.body}", tag="${notificationPayload.tag}"`);
					const results = await Promise.allSettled(
						pair_subs.map((p) => {
							notif_debug(`Attempting send for ${p.id}, endpoint=${p.sub.endpoint}`);
							return send_push_notif(p.sub, notificationPayload);
						})
					);
					notif_debug(`Send results for room ${params.i}: ${results.filter(r => r.status === 'fulfilled').length} success, ${results.filter(r => r.status === 'rejected').length} failed`);
					const to_prune: Record<string, string[]> = {};
					results.forEach((res, idx) => {
						if (res.status === 'rejected') {
							type MaybeWebPushErr = { statusCode?: number; status?: number; response?: { status?: number } };
							const err = res.reason as MaybeWebPushErr;
							const status = err.statusCode ?? err.status ?? err.response?.status;
							const { id, sub } = pair_subs[idx];
							notif_debug(`Send failed for ${id}, endpoint=${sub.endpoint}: status=${status}, err=${err}`);
							if (status === 404 || status === 410) {
								(to_prune[id] ||= []).push(sub.endpoint);
								notif_debug(`Marking for prune: endpoint=${sub.endpoint} for ${id}`);
							}
						}
					});
					for (const id of Object.keys(to_prune)) {
						const current = subs_by_user[id] || [];
						const pruned = current.filter((s) => !to_prune[id].includes(s.endpoint));
						notif_debug(`Pruning ${to_prune[id].length} invalid subs for ${id}, new length=${pruned.length}`);
						if (pruned.length !== current.length) {
							await set(id, { ps: pruned.length ? pruned : null });
						}
					}
					if (Object.keys(to_prune).length > 0) {
						notif_debug(`Final prune completed for room ${params.i}`);
					}
				} else {
					notif_debug(`No pair_subs for room ${params.i}, skipping send`);
				}
			} else {
				notif_debug(`No recipients for room ${params.i}, skipping push`);
			}
		} else {
			notif_debug(`Not private room for ${params.i}: _=${room?._ || 'null'}`);
		}
	} catch (e) {
		notif_debug(`Push notify error for room ${params.i}: ${e instanceof Error ? e.message : String(e)}`);
	}

	return new Response();
};
