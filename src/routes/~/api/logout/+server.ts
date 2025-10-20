import * as auth from '$lib/server/auth';

export async function POST(event) {
	const sessionToken = event.cookies.get(
		auth.sessionCookieName
	);
	if (sessionToken) {
		const [sessionId] = sessionToken.split('.');
		await auth.invalidateSession(sessionId);
	}
	auth.deleteSessionTokenCookie(event);
	auth.deleteSessionJwtCookie(event);
	return new Response(
		JSON.stringify({ success: true })
	);
}
