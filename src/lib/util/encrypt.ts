import { key } from './key';
export const encrypt = async () => {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const e = await crypto.subtle.encrypt(
		{ name: 'AES-GCM', iv },
		await key(),
		new TextEncoder().encode(Date.now() + 30 * 1000 + '')
	);
	const sB64 = btoa(String.fromCharCode(...new Uint8Array(e)));
	const ivB64 = btoa(String.fromCharCode(...iv));
	return '?s=' + encodeURIComponent(sB64) + '&iv=' + encodeURIComponent(ivB64);
};

export const decrypt = async (sB64: string, ivB64: string): Promise<string> => {
	const sBytes = Uint8Array.from(atob(sB64), c => c.charCodeAt(0));
	const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
	const d = await crypto.subtle.decrypt(
		{ name: 'AES-GCM', iv },
		await key(),
		sBytes
	);
	return new TextDecoder().decode(new Uint8Array(d));
};
