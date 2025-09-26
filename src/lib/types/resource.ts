export interface Resource {
	s: 'r'; // tenant id for resources
	n: string; // name
	b?: string; // body/description
	p?: string[]; // image urls array
	u: string; // user id
	d?: number; // created timestamp
	a?: string; // about/summary
}
