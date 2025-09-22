import * as argon2 from '@node-rs/argon2-wasm32-wasi';
import { fail, redirect } from '@sveltejs/kit';
import * as auth from '$lib/server/auth';
import type {
	Actions,
	PageServerLoad
} from './$types';
import { find_user_by_tag } from '$lib/db';
import { create_user } from '$lib/auth';

export const load: PageServerLoad = async ({
	locals
}) => {
	if (locals.user) {
		return redirect(302, '/');
	}
	return {};
};

export const actions: Actions = {
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, {
				message:
					'Invalid username (min 3, max 31 characters, alphanumeric only)'
			});
		}
		if (!validatePassword(password)) {
			return fail(400, {
				message:
					'Invalid password (min 6, max 255 characters)'
			});
		}

		const existingUser =
			await find_user_by_tag(username);
		// console.log('eu', existingUser)
		if (!existingUser) {
			return fail(400, {
				message: 'user does not exist'
			});
		}
		if (!existingUser.p) {
			return fail(500);
		}

		const validPassword = await argon2.verify(
			existingUser.p,
			password
		);
		if (!validPassword) {
			return fail(400, {
				message: 'Incorrect password'
			});
		}

		const session = await auth.createSession(
			existingUser.i as string
		);
		auth.setSessionTokenCookie(event, session);
		try {
			const [sessionId] = session.split('.') as [
				string,
				string?
			];
			const jwt = await auth.createSessionJWT({
				id: sessionId,
				createdAt: new Date()
			});
			auth.setSessionJwtCookie(event, jwt);
		} catch {}

		const next = event.cookies.get('login_next');
		if (next && next.startsWith('/')) {
			return redirect(302, next);
		}
		return redirect(302, '/');
	},

	register: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get(
			'username'
		) as string;
		const password = formData.get(
			'password'
		) as string;

		if (await find_user_by_tag(username as string)) {
			return fail(400, { message: 'tag taken' });
		}

		// if (!validateUsername(username)) {
		// 	return fail(400, { message: 'Invalid username' });
		// }
		// if (!validatePassword(password)) {
		// 	return fail(400, { message: 'Invalid password' });
		// }
		//
		// console.log('--login')

		const passwordHash = await argon2.hash(password);

		try {
			const userId = await create_user(username, {
				p: passwordHash
			});
			// console.log('created user', user)

			// console.log('i--', userId)
			const session = await auth.createSession(
				userId as string
			);
			// console.log('s', session)
			auth.setSessionTokenCookie(event, session);
			try {
				const [sessionId] = session.split('.') as [
					string,
					string?
				];
				const jwt = await auth.createSessionJWT({
					id: sessionId,
					createdAt: new Date()
				});
				auth.setSessionJwtCookie(event, jwt);
			} catch {}
		} catch {
			return fail(500, {
				message: 'An error has occurred'
			});
		}
		const next = event.cookies.get('login_next');
		if (next && next.startsWith('/')) {
			return redirect(302, next);
		}
		return redirect(302, '/');
	}
};

function validateUsername(
	username: unknown
): username is string {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-z0-9_-]+$/.test(username)
	);
}

function validatePassword(
	password: unknown
): password is string {
	return (
		typeof password === 'string' &&
		password.length >= 6 &&
		password.length <= 255
	);
}
