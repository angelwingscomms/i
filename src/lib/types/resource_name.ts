export interface ResourceName {
	s: string; // tenant id
	i: string; // resource id
	t: string; // title/tag
	d?: string; // description
	u: string; // user id (owner)
	a?: number; // created timestamp
}
