import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get } from '$lib/db';
import type { Item, User } from '$lib/types';
import { get_contact_links } from '$lib/util/items/contact_links';

export const load: PageServerLoad = async ({
	params,
	locals
}) => {
	const { i } = params;
	if (!i) error(400, 'missing item id');
	const item = await get<Record<string, unknown>>(i);
	if (!item) error(404, 'item not found');
	if (item.s !== 'i')
		error(400, 'this resource is not an item');

	let ownerTag = 'unknown';
	let ownerWhatsapp: string | undefined;
	let ownerDiscord: string | undefined;
	if (item.u) {
		const owner = await get<Pick<User, 't' | 'w' | 'x'>>(
			item.u as string,
			['t', 'w', 'x']
		);
		if (owner) {
			ownerTag = owner.t ?? ownerTag;
			const contacts = get_contact_links({
				w: owner.w,
				x: owner.x
			});
			ownerWhatsapp = contacts.whatsapp;
			ownerDiscord = contacts.discord;
		}
	}

	return {
		user: locals.user
			? { i: locals.user.i, t: locals.user.t }
			: null,
		i: {
			...(item as unknown as Item),
			i,
			ownerTag,
			ownerWhatsapp,
			ownerDiscord
		}
	};
};
