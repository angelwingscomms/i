// import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { set } from '$lib/db';
import { realtime } from '$lib/util/realtime';

export const load: PageServerLoad = async ({ locals, parent, url }) => {
	if (locals.user?.i) {
		await set(locals.user.i, { r: (await realtime.post('meetings', { title: 't' })).data.data.id });
	}
	const { seo: parent_seo } = await parent();

	const page_title = 'Angel Wings Communications - Homepage';
	const page_description =
		'Welcome to Angel Wings Communications, connecting people seamlessly through innovative communication solutions.';
	const page_image = `${url.origin}/homepage-og-image.jpg`; // Specific image for homepage

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
