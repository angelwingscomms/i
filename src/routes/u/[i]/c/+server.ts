import { create } from '$lib/db';
import type { RequestHandler } from './$types';
import type { ChatMessage, DBChatMessage, SendChatMessage, Message } from '$lib/types';
import { s } from '$lib/util/s';
import { cf } from '$lib/util/cf';
import { PUBLIC_WORKER } from '$env/static/public';
import { upload_image } from '$lib/integrations/r2_storage';

import { sendPushToUserId } from '$lib/server/push';
import { process_message } from '$lib/util/chat/process_message';

export const POST: RequestHandler = async ({ platform, request, params, locals }) => {
	// Parse multipart form data
	const formData = await request.formData();

	// Extract message metadata from form fields
	const messageText = formData.get('m') as string;
	const cloudflareId = formData.get('c') as string;
	const receiverTag = formData.get('t') as string;
	const timestamp = parseInt(formData.get('d') as string);
	const messageId = formData.get('i') as string;
	const anonymous = formData.get('a') as string;

	// Handle file uploads if present
	let fileUrls: string[] = [];
	const files = formData.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);

	if (files.length > 0 && platform?.env?.R2) {
		// Upload files to R2 storage
		for (const file of files) {
			try {
				const url = await upload_image(file, undefined, platform as any);
				fileUrls.push(url);
			} catch (e) {
				console.error('R2 upload error during message send:', e);
				// Continue with other files even if one fails
			}
		}
	}

	// Reconstruct SendChatMessage object
	const m: SendChatMessage = {
		m: messageText,
		c: cloudflareId,
		t: receiverTag,
		d: timestamp,
		i: messageId,
		...(anonymous && { a: anonymous }),
		...(fileUrls.length > 0 && { f: fileUrls })
	};

	const base: Message = {
		m: messageText,
		d: timestamp,
		i: messageId,
		c: cloudflareId,
		h: 0,
		t: receiverTag,
		r: params.i,
		s: 'm',
		...(anonymous && { a: anonymous }),
		...(fileUrls.length > 0 && { f: fileUrls }),
		...(locals.user ? { u: locals.user.i } : {})
	};
	const with_tc = await process_message(base);

	const i = await create(
		{
			...(locals.user ? { u: locals.user.i } : {}),
			s: 'm',
			d: with_tc.d,
			m: with_tc.m,
			r: params.i,
			tc: with_tc.tc,
			...(fileUrls.length > 0 && { f: fileUrls })
		} satisfies DBChatMessage & { tc?: number; f?: string[] },
		JSON.stringify({
			...(locals.user ? { sender: locals.user.t } : {}),
			receiver: m.t,
			sent_at: new Date(m.d).toLocaleString(undefined, {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit'
			}),
			message_text: m.m,
			...(fileUrls.length > 0 && { files: fileUrls })
		}),
		m.i
	);

	cf(platform)('http' + PUBLIC_WORKER + '/send/' + m.c + (await s()), {
		method: 'POST',
		body: JSON.stringify({
			i,
			...(locals.user ? { x: locals.user.t } : {}),
			m: m.m,
			...(fileUrls.length > 0 && { f: fileUrls })
		} satisfies ChatMessage)
	});

	// Send push notification to receiving user with chat ID
	try {
		await sendPushToUserId(params.i, m.t, locals.user?.i);
	} catch (err) {
		console.error('push notif error', err);
	}

	return new Response();
};
