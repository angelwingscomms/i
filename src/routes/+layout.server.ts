import type { LayoutServerLoad } from './~/$types';

export const load: LayoutServerLoad = async ({
	locals,
	url
}) => {
	const default_seo = {
		title: 'apexlinks',
		description:
			'Connecting people through seamless communication.',
		og_title: 'apexlinks',
		og_description:
			'Connecting people through seamless communication.',
		og_image: `${url.origin}/og-image.jpg`, // You'll need to create this image
		og_url: url.href,
		twitter_card: 'summary_large_image',
		twitter_title: 'apexlinks',
		twitter_description:
			'Connecting people through seamless communication.',
		twitter_image: `${url.origin}/twitter-image.jpg` // You'll need to create this image
	};

	return {
		user: locals.user,
		seo: default_seo
	};
};
