import {
	createSession,
	setSessionTokenCookie
} from '$lib/server/auth';
import {
	setSessionJwtCookie,
	createSessionJWT
} from '$lib/server/auth';
import { decodeIdToken, Google } from 'arctic';

import {
	redirect,
	type RequestEvent
} from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';
import { create_user } from '$lib/auth';
import { search_by_payload } from '$lib/db';
import type { User } from '$lib/types';
import {
	GOOGLE_ID,
	GOOGLE_SECRET
} from '$env/static/private';

export async function GET(
	event: RequestEvent
): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState =
		event.cookies.get('google_oauth_state') ?? null;
	const codeVerifier =
		event.cookies.get('google_code_verifier') ?? null;
	const google = new Google(
		GOOGLE_ID,
		GOOGLE_SECRET,
		`${event.url.origin}/google/callback`
	);
	// console.log('code:', code);
	// console.log('state:', state);
	// console.log('storedState:', storedState);
	// console.log('codeVerifier:', codeVerifier);
	if (
		code === null ||
		state === null ||
		storedState === null ||
		codeVerifier === null
	) {
		return new Response(null, {
			status: 400
		});
	}
	if (state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	let tokens: OAuth2Tokens;
	try {
		tokens = await google.validateAuthorizationCode(
			code,
			codeVerifier
		);
	} catch {
		// Invalid code or client credentials
		console.error(
			'Invalid code or client credentials',
			code,
			codeVerifier
		);
		redirect(302, '/google');
	}
	const res = decodeIdToken(tokens.idToken()) as {
		sub: string;
		email: string;
	};

	let user_id: string | undefined = undefined;

	const existingUsers = await search_by_payload<User>(
		{
			gid: res.sub,
			s: 'u'
		},
		false,
		1
	);

	console.log(existingUsers);

	if (existingUsers.length > 0) {
		user_id = existingUsers[0].i;
	} else {
		user_id = await create_user(
		res.email.replace('@gmail.com', ''),
		{ gid: res.sub, e: res.email.toLowerCase() }
		);
	}

	if (!user_id) {
		redirect(302, '/google');
	}

	const sessionToken = await createSession(user_id);

	setSessionTokenCookie(event, sessionToken);
	try {
		const [sessionId] = sessionToken.split('.') as [
			string,
			string?
		];
		const jwt = await createSessionJWT({
			id: sessionId,
			createdAt: new Date()
		});
		setSessionJwtCookie(event, jwt);
	} catch {}

	// Redirect to saved next path or fallback
	const next = event.cookies.get('login_next');
	if (next && next.startsWith('/')) {
		return new Response(null, {
			status: 302,
			headers: { Location: next }
		});
	}
	redirect(302, '/');
}
