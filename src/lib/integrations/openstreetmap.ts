const NOMINATIM_URL =
	'https://nominatim.openstreetmap.org/search';

type OSMResult = {
	place_id: string;
	display_name: string;
	lat: string;
	lon: string;
};

export type NormalizedPlace = {
	i: string; // reuse place_id as zone id
	p: string;
	n: string;
	l: number;
	g: number;
};

export async function search_openstreetmap(
	query: string,
	limit = 5
): Promise<NormalizedPlace[]> {
	if (!query.trim()) return [];
	const url = new URL(NOMINATIM_URL);
	url.searchParams.set('format', 'jsonv2');
	url.searchParams.set('limit', String(limit));
	url.searchParams.set('q', query.trim());
	const response = await fetch(url.toString(), {
		headers: {
			Accept: 'application/json',
			'User-Agent':
				'angelwings/zones (contact@angelwings.com)'
		}
	});
	if (!response.ok) {
		throw new Error('openstreetmap search failed');
	}
	const data = (await response.json()) as OSMResult[];
	return data.map((place) => ({
		i: String(place.place_id),
		p: String(place.place_id),
		n: place.display_name,
		l: Number(place.lat),
		g: Number(place.lon)
	}));
}
