const ALPHABET = 'abcdefghijklmnopqrstuvwxyz23456789';

export function generate_reset_token(
	length = 48
): string {
	const chars = [] as string[];
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	for (const byte of bytes) {
		chars.push(ALPHABET[byte % ALPHABET.length]);
	}
	return chars.join('');
}

export async function hash_reset_token(
	token: string
) {
	const data = new TextEncoder().encode(token);
	const digest = await crypto.subtle.digest(
		'SHA-256',
		data
	);
	return buffer_to_base64(new Uint8Array(digest));
}

export function normalize_email(email: string) {
	return email.trim().toLowerCase();
}

function buffer_to_base64(buffer: Uint8Array) {
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(buffer).toString('base64');
	}
	let binary = '';
	for (let i = 0; i < buffer.length; i++) {
		binary += String.fromCharCode(buffer[i]);
	}
	return btoa(binary);
}
