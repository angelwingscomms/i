// import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { get, qdrant, set } from '$lib/db';
import { collection } from '$lib/constants';
import { redirect } from '@sveltejs/kit';
import { realtime } from '$lib/util/realtime';

export const load: PageServerLoad = async ({ locals, parent, url }) => {
	if (!locals.user) redirect(302, '/f');
	let r;
	const res = await qdrant.query(collection, {
		filter: {
			must: { key: 'f', match: { value: 1 } }
		},
		query:
			(await get<{ vector: number[] }>(locals.user.i, false, true))?.vector ||
			new Array(3072).fill(0),
		with_payload: true,
		limit: 1
	});
	console.log('search res', res.points);
	if (res.points.length && res.points[0].payload?.r) {
		set(res.points[0].id as string, { f: '' });
		set(locals.user.i, { f: '' });
		r = (
			await realtime.post('meetings/' + res.points[0].payload?.r + '/participants', {
				name: locals.user?.t || 'Anonymous',
				// picture: locals.user?.p || '',
				preset_name: 'group_call_participant',
				custom_participant_id: locals.user?.i
			})
		).data.data.token;
	} else {
		const create_meeting_res = (await realtime.post('meetings', { title: 't' })).data.data.id;
		await set(locals.user.i, { r: create_meeting_res });
		await set(locals.user.i, { f: 1 });
		r = (
			await realtime.post('meetings/' + create_meeting_res + '/participants', {
				name: locals.user?.t || 'Anonymous',
				// picture: locals.user?.p || '',
				preset_name: 'group_call_participant',
				custom_participant_id: locals.user?.i
			})
		).data.data.token;
	}
	const { seo: parent_seo } = await parent();

	const page_title = 'Angel Wings Communications - Homepage';
	const page_description =
		'Welcome to Angel Wings Communications, connecting people seamlessly through innovative communication solutions.';
	const page_image = `${url.origin}/homepage-og-image.jpg`; // Specific image for homepage

	return {
		user: locals.user,
		r,
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
