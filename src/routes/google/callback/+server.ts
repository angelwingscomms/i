import { createSession } from '$lib/auth';
import { find_or_create_user, google } from '$lib/auth';
import { decodeIdToken } from 'arctic';
import jwt from 'jsonwebtoken';

import { redirect, type RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';
import { SECRET } from '$env/static/private';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const codeVerifier =
		event.cookies.get('google_code_verifier') ?? null;
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
		tokens = await google.validateAuthorizationCode(code, codeVerifier);
	} catch (e) {
		// Invalid code or client credentials
		return new Response(null, {
			status: 400
		});
	}
	const { sub: id, name } = decodeIdToken(tokens.idToken()) as {
		sub: string;
		name: string;
	};

	const user = await find_or_create_user({ id, name });

	if (!user) return new Response(null, { status: 500 });

	const session = await createSession(user.id as string);
	;
	event.cookies.set('se', session.t, {
		httpOnly: true,
		sameSite: 'lax',
		secure: true,
		maxAge: 43200 * 90,
		path: '/'
	});
	event.cookies.set('jwt', jwt.sign({ n: user.n, i: user.id }, SECRET), {
		path: '/'
	});
	redirect(302, '/');
}
