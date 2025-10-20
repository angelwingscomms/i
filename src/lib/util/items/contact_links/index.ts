type ContactPayload = {
	w?: string;
	x?: string[];
};

const clean_whatsapp = (value?: string) => {
	if (!value) return undefined;
	const digits = value.replace(/[^0-9]/g, '');
	return digits.length ? digits : undefined;
};

const find_discord = (links?: string[]) => {
	if (!links?.length) return undefined;
	return links.find((link) =>
		typeof link === 'string' &&
		link.toLowerCase().includes('discord')
	);
};

export const get_contact_links = (payload: ContactPayload) => {
	const whatsapp = clean_whatsapp(payload.w);
	const discord = find_discord(payload.x);
	return {
		...(whatsapp ? { whatsapp } : {}),
		...(discord ? { discord } : {})
	};
};
