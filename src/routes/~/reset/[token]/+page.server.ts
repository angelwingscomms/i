import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { search_by_payload } from '$lib/db';
import type { User } from '$lib/types';

export const load: PageServerLoad = async ({
	params
}) => {
	const token = params.token;
	if (!token) {
		redirect(302, '/~/reset');
	}
	const now = Date.now();
	const users = await search_by_payload<User>({
		s: 'u',
		pt: await hash(token)
	});
	const user = users.find(
		(u) => u.pt && u.pe && u.pe > now
	);
	if (!user?.i || !user.e) {
		redirect(302, '/~/reset/expired');
	}
	return {
		email: user.e,
		user_id: user.i
	};
};

async function hash(token: string) {
	const data = new TextEncoder().encode(token);
	const digest = await crypto.subtle.digest(
		'SHA-256',
		data
	);
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(digest).toString('base64');
	}
	let binary = '';
	const bytes = new Uint8Array(digest);
	for (let i = 0; i < bytes.length; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary);
}
