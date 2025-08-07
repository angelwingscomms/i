import type { Handle } from '@sveltejs/kit';
import { validateSessionToken, sessionCookieName, setSessionTokenCookie } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get(sessionCookieName);
	// console.log('st', sessionToken)

	if (!sessionToken) {
		return resolve(event);
	}

	const { session, user } = await validateSessionToken(sessionToken);
	// console.log('su', session, user)

	if (!user || !session) return resolve(event);

	// Refresh cookie maxAge to keep session alive up to 1 year of inactivity
	setSessionTokenCookie(event, sessionToken);

	event.locals.user = { i: user.i, t: user.t };
	event.locals.session = session;
	return resolve(event);
};
