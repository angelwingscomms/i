import { createSession, findOrCreateUser, google, setSessionTokenCookie } from '$lib/server/auth';
import { decodeIdToken } from 'arctic';

import { redirect, type RequestEvent } from '@sveltejs/kit';
import type { OAuth2Tokens } from 'arctic';

export async function GET(event: RequestEvent): Promise<Response> {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get('google_oauth_state') ?? null;
	const codeVerifier = event.cookies.get('google_code_verifier') ?? null;
	console.log('code:', code);
	console.log('state:', state);
	console.log('storedState:', storedState);
	console.log('codeVerifier:', codeVerifier);
	if (code === null || state === null || storedState === null || codeVerifier === null) {
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
	} catch {
		// Invalid code or client credentials
		console.error('Invalid code or client credentials');
		return new Response(null, {
			status: 400
		});
	}
	const { sub: id, name } = decodeIdToken(tokens.idToken()) as {
		sub: string;
		name: string;
	};

	const user = await findOrCreateUser({ id, name });
	console.log(user)

	if (!user) return new Response(null, { status: 500 });

	const sessionToken = await createSession((user as any).i as string);

	setSessionTokenCookie(event, sessionToken, new Date(Date.now() + 777600 * 1000));
	redirect(302, '/');
}
