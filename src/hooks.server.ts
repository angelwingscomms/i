import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { validateSessionToken, sessionCookieName } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	console.log(event.request.url);

	const sessionToken = event.cookies.get(sessionCookieName);
	// console.log('st', sessionToken)

	if (!sessionToken) {
		return resolve(event);
	}

	const { session, user } = await validateSessionToken(sessionToken);
	// console.log('su', session, user)

	// if (session) {
	// 	auth.setSessionTokenCookie(event, sessionToken);
	// } else {
	// 	auth.deleteSessionTokenCookie(event);
	// }
	//
	if (!user) return resolve(event);

	event.locals.user = { i: user.i, t: user.t };
	event.locals.session = session;
	return resolve(event);
};