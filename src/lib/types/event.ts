export interface Event {
	s: 'ev'; // tenant for events
	i?: string; // event id
	n?: string; // name
	tag?: string; // tag (formerly title)
	b?: string; // body (markdown)
	y?: string; // summary
	p?: string; // image url
	v?: string; // private: "" public, "." private
	c?: string; // show child posts: "" false, "." true
	u?: string; // user id
	d: number; // created timestamp
	l?: number; // last updated
	r?: string; // realtime room
	z?: string[]; // zones
	f?: string; // parent event id
}
