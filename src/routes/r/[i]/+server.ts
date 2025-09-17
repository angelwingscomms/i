import { create } from '$lib/db';
import type { RequestHandler } from './$types';
import type {
	DBChatMessage,
	SendChatMessage,
	Message
} from '$lib/types';
import { upload_image } from '$lib/integrations/r2_storage';
import { process_message } from '$lib/util/chat/process_message';
import { error } from 'console';
import { realtime } from '$lib/util/realtime';
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

	return new Response();
};
