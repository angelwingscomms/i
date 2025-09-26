import * as auth from '$lib/server/auth';
import {
	hashPassword,
	verifyPassword
} from 'worker-password-auth';
import { find_user_by_tag } from '$lib/db';
import { create_user } from '$lib/auth';

export async function PUT(event) {
	const { username, password } =
		await event.request.json();

	if (!validateUsername(username)) {
		return new Response(
			JSON.stringify({
				error:
					'Invalid username (min 3, max 31 characters, alphanumeric only)'
			}),
			{ status: 400 }
		);
	}
	if (!validatePassword(password)) {
		return new Response(
			JSON.stringify({
				error:
					'Invalid password (min 6, max 255 characters)'
			}),
			{ status: 400 }
		);
	}

	const existingUser =
		await find_user_by_tag(username);
	if (!existingUser) {
		return new Response(
			JSON.stringify({
				error: 'user does not exist'
			}),
			{ status: 400 }
		);
	}
	if (!existingUser.p) {
		return new Response(
			JSON.stringify({
				error: 'Internal server error'
			}),
			{ status: 500 }
		);
	}

	const isValid = await verifyPassword(
		password,
		existingUser.p
	);
	if (!isValid) {
		return new Response(
			JSON.stringify({
				error: 'Incorrect password'
			}),
			{ status: 400 }
		);
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
	} catch (e) {
		console.error('create session error:', e);
		return new Response(
			JSON.stringify({
				error: 'Internal server error'
			}),
			{ status: 500 }
		);
	}

	const next = event.cookies.get('login_next');
	const redirectUrl =
		next && next.startsWith('/') ? next : '/';
	return new Response(
		JSON.stringify({
			success: true,
			redirect: redirectUrl
		}),
		{ status: 200 }
	);
}

export async function POST(event) {
	const { username, password } =
		await event.request.json();

	if (!validateUsername(username)) {
		return new Response(
			JSON.stringify({
				error:
					'Invalid username (min 3, max 31 characters, alphanumeric only)'
			}),
			{ status: 400 }
		);
	}
	if (!validatePassword(password)) {
		return new Response(
			JSON.stringify({
				error:
					'Invalid password (min 6, max 255 characters)'
			}),
			{ status: 400 }
		);
	}

	if (await find_user_by_tag(username)) {
		return new Response(
			JSON.stringify({
				error: 'tag taken'
			}),
			{ status: 400 }
		);
	}

	const passwordHash = await hashPassword(password);

	try {
		const userId = await create_user(username, {
			p: passwordHash
		});

		const session = await auth.createSession(
			userId as string
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
		} catch (e) {
			console.error('create session error:', e);
			return new Response(
				JSON.stringify({
					error: 'Internal server error'
				}),
				{ status: 500 }
			);
		}
	} catch {
		return new Response(
			JSON.stringify({
				error: 'An error has occurred'
			}),
			{ status: 500 }
		);
	}
	const next = event.cookies.get('login_next');
	const redirectUrl =
		next && next.startsWith('/') ? next : '/';
	return new Response(
		JSON.stringify({
			success: true,
			redirect: redirectUrl
		}),
		{ status: 200 }
	);
}

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
