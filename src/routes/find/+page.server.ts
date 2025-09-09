// import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, parent, url }) => {
	const { seo: parent_seo } = await parent();

	const page_title = 'Apexlinks - Find Matches';
	const page_description =
		'Live video matching with age and gender filters, like Omegle but better. Connect anonymously and discover real conversations.';
	const page_image = `${url.origin}/matching-og-image.jpg`; // Specific image for find page

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