import type { DiaryEntry } from '$lib/types';

export const diary_day_key = (timestamp: number) => {
	return new Date(timestamp)
		.toISOString()
		.slice(0, 10);
};

export const diary_day_range = (day: string) => {
	const start = new Date(`${day}T00:00:00.000Z`).getTime();
	const end = new Date(`${day}T23:59:59.999Z`).getTime();
	return { start, end };
};

export const diary_payload = ({
	text,
	user,
	date,
	embedding
}: {
	text: string;
	user: string;
	date: number;
	embedding?: string;
}): DiaryEntry => ({
	s: 'diary',
	u: user,
	d: date,
	a: text,
	e: embedding
});

export const diary_filter = ({
	user,
	day
}: {
	user: string;
	day?: string;
}) => {
	const must: Record<string, unknown>[] = [
		{ key: 's', match: { value: 'diary' } },
		{ key: 'u', match: { value: user } }
	];

	if (day) {
		const { start, end } = diary_day_range(day);
		must.push({
			key: 'd',
			range: {
				gte: start,
				lte: end
			}
		});
	}

	return { must };
};

export const recent_diary_sort = (
	entries: DiaryEntry[]
) =>
	[...entries].sort((a, b) => b.d - a.d);

export const group_diary_by_day = (
	entries: DiaryEntry[]
) => {
	return entries.reduce<Record<string, DiaryEntry[]>>(
		(acc, entry) => {
			const day = diary_day_key(entry.d);
			if (!acc[day]) acc[day] = [];
			acc[day].push(entry);
			return acc;
		},
		{}
	);
};
