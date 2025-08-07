import type { Handle } from '@sveltejs/kit';
import { validateSessionToken, sessionCookieName, setSessionTokenCookie } from '$lib/server/auth';
import { dev } from '$app/environment';

let env = {};
if (dev) {
	const { Miniflare } = await import('miniflare');
	env = await new Miniflare({
		modules: true,
		// serviceBindings: {
		// 	i: async (request) => {
		// 		return new Request('localhost:1440', request);
		// 	}
		// },
		scriptPath: await (async () => {
			const base = 'r/.wrangler/tmp';
			try {
				const fs = await import('node:fs');
				const path = await import('node:path');
				const tmpDir = path.resolve(base);
				if (!fs.existsSync(tmpDir)) return 'r/.wrangler/tmp/dev/index.js';

				const entries = fs.readdirSync(tmpDir, { withFileTypes: true });
				for (const entry of entries) {
					if (entry.isDirectory() && entry.name.startsWith('dev-')) {
						const candidate = path.join(tmpDir, entry.name, 'index.js');
						if (fs.existsSync(candidate)) {
							return path.relative(process.cwd(), candidate).replaceAll('\\', '/');
						}
					}
				}
			} catch {
				// ignore and use a generic fallback
			}
			// Fallback if none found
			return 'r/.wrangler/tmp/dev/index.js';
		})()
	}).getBindings();
}

export const handle: Handle = async ({ event, resolve }) => {
	if (dev) {
		event.platform = { ...event.platform, env };
	}
	console.log(event.request.url);

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
