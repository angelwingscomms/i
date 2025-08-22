export interface Item {
	s: 'i';
	t: string; // name/title
	d?: string; // original description
	q?: string; // description summary (gemini)
	v?: number; // stock count
	k?: 0 | 1; // kind: 0 product, 1 service
	l?: number; // lat
	n?: number; // lon
	c?: Record<string, unknown>; // compact map
	x?: string[]; // images urls
	a?: number; // created timestamp
}

