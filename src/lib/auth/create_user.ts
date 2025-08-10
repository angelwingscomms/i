import { create } from '$lib/db';
import type { User } from '$lib/types';

export const create_user = async (tag: string, other: { p?: string; gid?: string }) => {
	return await create<User>({
		s: 'u',
		t: tag,
		d: '', // empty description initially
		a: 18, // default age
		g: 0, // default male
		l: 0, // default latitude
		n: 0, // default longitude
		w: '', // empty whatsapp link initially
		c: {}, // required compact map, initially empty
		dc: Date.now(), // date created
		...other
	});
};
