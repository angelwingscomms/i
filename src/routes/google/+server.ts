import { generateState, generateCodeVerifier } from 'arctic';
import { google } from '$lib/server/auth';

import type { RequestEvent } from '@sveltejs/kit';

export async function GET(event: RequestEvent): Promise<Response> {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = google.createAuthorizationURL(state, codeVerifier, ['openid', 'profile', 'email']);

	// Capture intended redirect after login
	const next = event.url.searchParams.get('next');
	if (next && next.startsWith('/')) {
		event.cookies.set('login_next', next, {
			path: '/',
			httpOnly: true,
			maxAge: 300,
			sameSite: 'lax'
		});
	}

	event.cookies.set('google_oauth_state', state, {
		path: '/',
		httpOnly: true,
		maxAge: 432000 * 90,
		sameSite: 'lax'
	});
	event.cookies.set('google_code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		maxAge: 432000 * 90,
		sameSite: 'lax'
	});

	return new Response(null, {
		status: 302,
		headers: {
			Location: url.toString()
		}
	});
}
