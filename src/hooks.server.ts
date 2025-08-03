import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { validateSessionToken, sessionCookieName } from '$lib/server/auth';

// let env = {};

if (dev) {
	/*
  We need to import miniflare here conditionally in dev since the esbuild which runs during
  `npm run build` won't be able to resolve `node:*` imports since they aren't marked as external.

  See the following for more info:
  - https://github.com/sveltejs/kit/issues/10732
  - https://github.com/sveltejs/kit/pull/10544
*/
	// const { Miniflare } = await import('miniflare');
	// const mf = new Miniflare({
	// 	modules: true,
	// 	durableObjects: { COUNTER: 'Counter' },
	// 	durableObjectsPersist: '.wrangler/state/v3/do',
	// 	scriptPath: 'durable-objects/counter/index.js'
	// });

	// env = await mf.getBindings();
}

const handleAuth: Handle = async ({ event, resolve }) => {
	// if (dev) {
	// 	event.platform = {
	// 		...event.platform,
	// 		env
	// 	};
	// }

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

export const handle: Handle = handleAuth;
