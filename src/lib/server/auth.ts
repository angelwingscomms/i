import { Google } from 'arctic';
import { GOOGLE_ID, GOOGLE_SECRET, GOOGLE_REDIRECT_URL } from '$env/static/private';
import { getById, searchByPayload, upsertPoint, delete_ } from '$lib/db';
import type { User } from '$lib/types';
import { v7 } from 'uuid';
import type { RequestEvent } from '@sveltejs/kit';

export const google = new Google(GOOGLE_ID, GOOGLE_SECRET, GOOGLE_REDIRECT_URL);

export const sessionCookieName = 'auth_session';

interface Session {
	s: 'se';
	i: string; // session id
	u: string; // user id
	h: string; // hash (base64)
	c: number; // created at
	l: number; // last activity
	expiresAt: Date;
}

export interface SessionValidationResult {
	session: Session | null;
	user: User | null;
}

const ACTIVITY_CHECK_INTERVAL = 1440; // milliseconds
const INACTIVITY_TIMEOUT = 777600 * 1000; // milliseconds

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const now = Date.now();
	const tokenParts = token.split('.');

	if (tokenParts.length !== 2) {
		return { session: null, user: null };
	}

	const [sessionId, sessionSecret] = tokenParts;

	try {
		const session = await getById<Session>(sessionId);

		if (!session) {
			return { session: null, user: null };
		}

		// Check if session expired
		if (now - session.l >= INACTIVITY_TIMEOUT) {
			await delete_(sessionId);
			return { session: null, user: null };
		}

		// Verify session secret
		const tokenSecretHash = await hashSecret(sessionSecret);
		const storedHash = base64ToUint8(session.h);
		const isValid = constantTimeEqual(tokenSecretHash, storedHash);

		if (!isValid) {
			return { session: null, user: null };
		}

		// Update activity if enough time has passed
		if (now - session.l >= ACTIVITY_CHECK_INTERVAL) {
			session.l = now;
			await upsertPoint(session);
		}

		// Get user
		const user = await getById<User>(session.u);
		if (!user) {
			await delete_(sessionId);
			return { session: null, user: null };
		}

		return { session, user };
	} catch (error) {
		console.error('Session validation error:', error);
		return { session: null, user: null };
	}
}

export async function createSession(userId: string): Promise<string> {
	const now = Date.now();
	const sessionId = v7();
	const secret = generateSecureRandomString();
	const hash = await hashSecret(secret);
	const hashBase64 = uint8ToBase64(hash);

	const session: Session = {
		s: 'se',
		i: sessionId,
		u: userId,
		h: hashBase64,
		c: now,
		l: now,
		expiresAt: new Date(now + INACTIVITY_TIMEOUT)
	};

	await upsertPoint(session);
	return `${sessionId}.${secret}`;
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await delete_(sessionId);
}

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: Date): void {
	event.cookies.set(sessionCookieName, token, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		expires: expiresAt
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.delete(sessionCookieName, {
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax'
	});
}

export async function findOrCreateUser(googleUser: { id: string; name: string }): Promise<User> {
	// Search for existing user by Google ID
	const existingUsers = await searchByPayload<User>(
		{
			s: 'u',
			gid: googleUser.id
		},
		1
	);

	if (existingUsers.length > 0) {
		return existingUsers[0];
	}

	// Create new user if not found
	const newUser: User = {
		s: 'u',
		t: googleUser.name.toLowerCase().replace(/\s+/g, ''), // generate tag from name
		d: '', // empty description initially
		a: 18, // default age
		g: 0, // default male
		l: 0, // default latitude
		n: 0, // default longitude
		w: '', // empty whatsapp link initially
		gid: googleUser.id // store google id
	};

	return await upsertPoint(newUser);
}

// Helper functions
function generateSecureRandomString(): string {
	const alphabet = 'abcdefghijklmnpqrstuvwxyz23456789';
	const bytes = new Uint8Array(24);
	crypto.getRandomValues(bytes);

	let id = '';
	for (let i = 0; i < bytes.length; i++) {
		id += alphabet[bytes[i] >> 3];
	}
	return id;
}

async function hashSecret(secret: string): Promise<Uint8Array> {
	const secretBytes = new TextEncoder().encode(secret);
	const secretHashBuffer = await crypto.subtle.digest('SHA-256', secretBytes);
	return new Uint8Array(secretHashBuffer);
}

function uint8ToBase64(arr: Uint8Array): string {
	if (typeof Buffer !== 'undefined') {
		return Buffer.from(arr).toString('base64');
	}
	return btoa(String.fromCharCode(...arr));
}

function base64ToUint8(str: string): Uint8Array {
	if (typeof Buffer !== 'undefined') {
		return new Uint8Array(Buffer.from(str, 'base64'));
	}
	const binary = atob(str);
	const arr = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		arr[i] = binary.charCodeAt(i);
	}
	return arr;
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
	if (a.length !== b.length) return false;
	let result = 0;
	for (let i = 0; i < a.length; i++) {
		result |= a[i] ^ b[i];
	}
	return result === 0;
}
