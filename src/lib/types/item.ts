export interface Item {
	s: 'i';
	i?: string; // item id
	t: string; // name/title
	a?: string; // about
	q?: string; // about summary (gemini)
	v?: number; // price
	m?: string; // currency
	k?: 0 | 1; // kind: 0 product, 1 service
	l?: number; // lat
	n?: number; // lon
	u: string; // user id
	p?: string; // private: "" public, "." private
	c?: Record<string, unknown>; // compact map
	x?: string[]; // images urls
	d?: number; // date created
	z?: string[]; // zones
}