// Resource entity (tenant-id 'r')
export interface Resource {
	s: 'r'; // tenant id for resources
	n: string; // name
	b?: string; // bio/body/description/about
	p?: string[]; // image urls array
	u: string; // user id
	d: number; // created timestamp
}
