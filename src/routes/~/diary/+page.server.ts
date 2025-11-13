import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { search_by_payload } from '$lib/db';
import type { DiaryEntry } from '$lib/types';
import {
	diary_filter,
	group_diary_by_day,
	recent_diary_sort
} from '$lib/util/diary';

export const load: PageServerLoad = async ({
	locals,
	url
}) => {
	const user = locals.user;
	if (!user) error(401, 'not authorized');

	const selected_date =
		url.searchParams.get('date') || null;

	console.log(
		'usdf',
		user.i,
		'fetching diary for date',
		selected_date
	);

	const filter_payload = diary_filter({
		user: user.i,
		...(selected_date ? { day: selected_date } : {})
	});

	console.log(
		JSON.stringify(
			{
				diary_filter: {
					payload: filter_payload
				}
			},
			null,
			2
		)
	);

	const entries = await search_by_payload<DiaryEntry>(
		filter_payload.must,
		true,
		30,
		{ key: 'd', direction: 'desc' }
	);

	const sorted = recent_diary_sort(entries);
	const grouped = group_diary_by_day(sorted);

	const dates = Object.keys(grouped).sort((a, b) =>
		b.localeCompare(a)
	);

	return {
		e: sorted,
		g: grouped,
		d: dates,
		s: selected_date
	};
};
