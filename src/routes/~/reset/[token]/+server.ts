import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { search_by_payload, set } from '$lib/db';
import type { User } from '$lib/types';
import {
	hash_reset_token
} from '$lib/util/auth/reset';
import { hashPassword } from 'worker-password-auth';

export const POST: RequestHandler = async ({
	params,
	request
}) => {
	const token = params.token;
	if (!token) {
		return json({ error: 'invalid token' }, { status: 400 });
	}
	const { password } = await request.json();
	if (typeof password !== 'string' || password.length < 6) {
		return json(
			{ error: 'password must be at least 6 characters' },
			{ status: 400 }
		);
	}

	const hashed = await hash_reset_token(token);
	const users = await search_by_payload<User>({
		s: 'u',
		pt: hashed
	});
	const now = Date.now();
	const user = users.find((u) => u.pe && u.pe > now && u.i);
	if (!user?.i) {
		return json(
			{ error: 'reset link expired' },
			{ status: 400 }
		);
	}

	const passwordHash = await hashPassword(password);
	await set(user.i, {
		p: passwordHash,
		pt: '',
		pe: 0,
		pr: 0
	});

	return json({
		message: 'password updated',
		redirect: '/login'
	});
};
