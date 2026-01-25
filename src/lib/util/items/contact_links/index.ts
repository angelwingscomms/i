type ContactPayload = {
	w?: string;
	x?: Record<string, string>;
};

const clean_whatsapp = (value?: string) => {
	if (!value) return undefined;
	const digits = value.replace(/[^0-9]/g, '');
	return digits.length ? digits : undefined;
};

const find_discord = (links?: Record<string, string>) => {
	if (!links) return undefined;
	for (const [key, url] of Object.entries(links)) {
		if (
			key.toLowerCase().includes('discord') ||
			(typeof url === 'string' &&
				url.toLowerCase().includes('discord'))
		) {
			return url;
		}
	}
	return undefined;
};

export const get_contact_links = (
	payload: ContactPayload
) => {
	const whatsapp = clean_whatsapp(payload.w);
	const discord = find_discord(payload.x);
	return {
		...(whatsapp ? { whatsapp } : {}),
		...(discord ? { discord } : {})
	};
};
