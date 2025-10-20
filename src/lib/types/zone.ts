export interface Zone {
	s: 'z'; // tenant for zones
	i?: string; // zone id (uuid or place_id)
	p?: string; // openstreetmap place id
	n: string; // name
	l: number; // latitude
	g: number; // longitude
	c?: string[]; // children (post/item ids)
	u?: string; // user id
	d?: number; // created timestamp
}
