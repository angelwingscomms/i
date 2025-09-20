import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({
	locals,
	parent,
	url
}) => {
	const { seo: parent_seo } = await parent();

	const page_title = 'Apexlinks - Connect Genuinely';
	const page_description =
		'easily find products and services you want. discover real chats, rooms, AI tools – anonymous and fun. filter by age, gender, location for effortless connections.';
	const page_image = `${url.origin}/landing-og-image.jpg`; // Specific image for landing page

	return {
		user: locals.user,
		seo: {
			...parent_seo, // Spread parent SEO to inherit defaults
			title: page_title,
			description: page_description,
			og_title: page_title,
			og_description: page_description,
			og_image: page_image,
			og_url: url.href,
			twitter_title: page_title,
			twitter_description: page_description,
			twitter_image: page_image
		}
	};
};
