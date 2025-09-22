import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	invalidateSession,
	deleteSessionTokenCookie,
	deleteSessionJwtCookie,
	sessionCookieName
} from '$lib/server/auth';

export const POST: RequestHandler = async ({
	cookies,
	locals
}) => {
	// Get the session token from cookies
	const sessionToken = cookies.get(sessionCookieName);

	if (sessionToken && locals.session) {
		// Invalidate the session in the database
		await invalidateSession(locals.session.i);
	}

	// Delete the session cookie
	deleteSessionTokenCookie({
		cookies,
		locals
	} as any);
	deleteSessionJwtCookie({ cookies, locals } as any);

	return json({ ok: true });
};