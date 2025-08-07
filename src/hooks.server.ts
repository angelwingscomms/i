import type { Handle } from '@sveltejs/kit';
import { validateSessionToken, sessionCookieName, setSessionTokenCookie } from '$lib/server/auth';
import { dev } from '$app/environment';

let env = {};
if (dev) {
	const { Miniflare } = await import('miniflare');
	env = await new Miniflare({
		modules: true,
		serviceBindings: {
			i: async (request) => {
				return new Request('localhost:1440', request);
			}
		},
		scriptPath: await (async() => {
			// Dynamically find r/.wrangler/tmp/dev-*/index.js
			// Works for any random suffix after "dev-"
			const base = 'r/.wrangler/tmp';
			try {
				// Use dynamic import to access node:fs and node:path without require()
				// These are only used in dev and inside a sync IIFE.
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				const fs = await import('node:fs');
				// eslint-disable-next-line @typescript-eslint/no-var-requires
				const path = await import('node:path');

				const tmpDir = path.resolve(base);
				if (!fs.existsSync(tmpDir)) return 'r/.wrangler/tmp/dev/index.js';

				const entries = fs.readdirSync(tmpDir, { withFileTypes: true });
				// Prefer a directory starting with "dev-" and containing index.js
				for (const entry of entries) {
					if (entry.isDirectory() && entry.name.startsWith('dev-')) {
						const candidate = path.join(tmpDir, entry.name, 'index.js');
						if (fs.existsSync(candidate)) {
							return path.relative(process.cwd(), candidate).replaceAll('\\', '/');
						}
					}
				}
				// Fallback: if there's a dev directory without suffix
				const fallback = path.join(tmpDir, 'dev', 'index.js');
				if (fs.existsSync(fallback)) {
					return path.relative(process.cwd(), fallback).replaceAll('\\', '/');
				}
			} catch {
				// ignore and use a generic fallback
			}
			// Generic fallback if detection fails
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
