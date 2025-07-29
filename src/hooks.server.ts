import type { Handle } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

const handleAuth: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(auth.sessionCookieName);
  // console.log('st', sessionToken)

	if (!sessionToken) {
		return resolve(event);
	}

	const { session, user } = await auth.validateSessionToken(sessionToken);
	// console.log('su', session, user)

	// if (session) {
	// 	auth.setSessionTokenCookie(event, sessionToken);
	// } else {
	// 	auth.deleteSessionTokenCookie(event);
	// }
	// 
	if (!user) return resolve(event)

	event.locals.user = {i: user.i, t: user.t};
	event.locals.session = session;
	return resolve(event);
};

export const handle: Handle = handleAuth;
