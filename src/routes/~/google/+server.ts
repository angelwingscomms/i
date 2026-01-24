import {
	generateState,
	generateCodeVerifier,
	Google
} from 'arctic';

import type { RequestEvent } from '@sveltejs/kit';
import {
	GOOGLE_ID,
	GOOGLE_SECRET
} from '$env/static/private';

export async function GET(
	event: RequestEvent
): Promise<Response> {
	const redirectUrl = `${event.url.origin}/~/google/callback`;
	console.log('[Google Auth Init]', {
		hasGoogleId: !!GOOGLE_ID,
		hasGoogleSecret: !!GOOGLE_SECRET,
		redirectUrl,
		googleIdPrefix: GOOGLE_ID?.substring(0, 10),
		googleSecretLength: GOOGLE_SECRET?.length
	});
	
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const google = new Google(
		GOOGLE_ID,
		GOOGLE_SECRET,
		redirectUrl
	);
	const url = google.createAuthorizationURL(
		state,
		codeVerifier,
		['openid', 'profile', 'email']
	);

	// Capture intended redirect after login
	const next = event.url.searchParams.get('next');
	if (next && next.startsWith('/')) {
		event.cookies.set('login_next', next, {
			path: '/',
			httpOnly: true,
			secure: false,
			maxAge: 300,
			sameSite: 'lax'
		});
	}

	event.cookies.set('google_oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: false,
		maxAge: 432000 * 90,
		sameSite: 'lax'
	});
	event.cookies.set(
		'google_code_verifier',
		codeVerifier,
		{
			path: '/',
			httpOnly: true,
			secure: false,
			maxAge: 432000 * 90,
			sameSite: 'lax'
		}
	);

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
}
