import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// VAPID keys - In production, these should be environment variables
const PUBLIC_VAPID_KEY =
	'BEl62iUYgUivxIkv69yViEuiBIa40HcCWLEaQK07x8hiKSHjfcHqLm1kZHLQjF4rXYJd4BPZ09lS1P9_4M4CsUg';

// Only GET to retrieve VAPID public key

// GET endpoint to retrieve VAPID public key
export const GET: RequestHandler = async () => {
	return json({
		publicKey: PUBLIC_VAPID_KEY
	});
};
