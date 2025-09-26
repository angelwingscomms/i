import type { Zone } from './zone';

export interface Item {
	s: 'i';
	i?: string; // item id
	n: string; // name/title
	a?: string; // about
	q?: string; // about summary (gemini)
	p?: number; // price
	m?: string; // currency
	k?: 0 | 1; // kind: 0 product, 1 service
	l?: number; // lat
	g?: number; // lon
	u: string; // user id
	h?: string; // hidden: "" public, "." private
	x?: string[]; // images urls
	c: string; // currency
	d?: number; // date created
	z?: Zone[]; // zones
}
