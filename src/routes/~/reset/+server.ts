import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { find_user_by_email, set } from '$lib/db';
import {
	normalize_email,
	generate_reset_token,
	hash_reset_token
} from '$lib/util/auth/reset';
import { send_reset_email } from '$lib/util/email/send_reset_email';

const DAY_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_MS = 5 * 60 * 1000;
const RESET_EMAIL_FROM = 'reset@i.local';

export const POST: RequestHandler = async ({
	request,
	platform
}) => {
	const { email } = await request.json();
	if (typeof email !== 'string') {
		return json(
			{ error: 'invalid email' },
			{ status: 400 }
		);
	}
	const normalized = normalize_email(email);
	if (
		!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)
	) {
		return json(
			{ error: 'invalid email' },
			{ status: 400 }
		);
	}

	const user = await find_user_by_email(normalized);
	if (!user?.i) {
		return json({
			message:
				'if the email exists, a reset link was sent'
		});
	}

	const now = Date.now();
	if (user.pr && now - user.pr < RATE_LIMIT_MS) {
		return json(
			{
				error: 'reset already requested recently'
			},
			{ status: 429 }
		);
	}

	const token = generate_reset_token();
	const token_hash = await hash_reset_token(token);
	const expires = now + DAY_MS;

	await set(user.i, {
		pt: token_hash,
		pe: expires,
		pr: now
	});

	const url = new URL(`/reset/${token}`, request.url);

	try {
		await send_reset_email(
			platform?.env as any,
			RESET_EMAIL_FROM,
			normalized,
			url.toString()
		);
	} catch (err) {
		console.error('send email error', err);
		return json(
			{ error: 'failed to send email' },
			{ status: 500 }
		);
	}

	return json({
		message:
			'if the email exists, a reset link was sent'
	});
};
