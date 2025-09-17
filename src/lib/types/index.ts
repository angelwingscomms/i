import type { PushSubscription } from 'web-push';

export interface LocalsUser {
	t: string;
	i: string;
	d?: string;
	av?: string;
	a?: number;
	g?: number;
}

export interface User {
	s: string; // type/tenant (e.g., 'u' user, 'se' session, 'm' message, 'n' notif sub)
	t: string; // tag
	av?: string; // avatar data url or external url
	d?: string; // description
	a?: number; // age
	g?: number; // gender, 0 is male, 1 is female
	l?: number; // latitude
	n?: number; // longitude
	w?: string; // whatsapp link
	gid?: string; // google id
	p?: string; // password hash
	i?: string; // user id
	dc?: number; // date created
	on?: number; // last online timestamp (ms)
	ic?: boolean; // currently in call
	r?: string; // realtime meeting id
	c: Record<string, string>;
	x?: string[]; // contact links,
	rt?: string; // realtime room token
	isAdmin?: boolean; // whether user is an admin
	ps?: PushSubscription[]; // push subscription
}

export interface Group {
	id: string; // group id
	name: string; // group name
	description?: string; // group description
	creatorId: string; // id of user who created the group
	createdAt?: string; // creation timestamp
	memberCount?: number; // number of members in the group
	isMember?: boolean; // whether the current user is a member
}

export interface NotificationSubscription {
	s: 'n'; // tenant id for notification subscriptions
	u: string; // user uuid
	sub: PushSubscription;
}

export type DBChatMessage = Pick<Message, 's' | 'u' | 'm' | 'd' | 'r' | 'q'>;

// Client-to-server payload when sending a chat message. "a" is an optional
// flag used by anon rooms; it is not part of the persisted Message payload.
export type SendChatMessage = Pick<Message, 'saved' | 'm' | 'i' | 'd' | 't' | 'f'> & { a?: string };

export type ChatMessage = Pick<Message, 'saved' | 'm' | 'i' | 'x' | 'f' | 'u'>;

export interface Message {
	saved?: boolean; // if client has received websocket event for this message, meaning message has been saved to db
	m: string; // message
	i: string; //id
	x?: string; // sender user tag,
	d: number; // date
	h: number; // has reply
	z?: string; // chat id
	q?: string; // realtime meeting id
	t: string; // receiver's (room/user) tag
	s?: 'm'; // tenant id for messages
	u?: string; // user ID
	r: string; // receiver ID (room/user)
	tc?: number; // token count
	f?: string[]; // file URLs array
}

export interface Room {
	s: 'r'; // tenant id for rooms
	i: string; // room id
	t: string; // room tag/name
	a?: string; // about room
	u?: string; // creator user id
	r?: string; // receiver id
	c: string; // cloudflare id (text chat WS id)
	o?: string; // optional: realtime/AV room id
	d?: number; // creation timestamp
	m?: number; // number of members
	q?: string; // realtime meeting id
	l?: number; // time of last message
	x?: string[]; // member user ids
	_?: ',' | '.' | '-' | '|'; // room type: - is anon, `|` is one one one (dm), `,` is private, `.` is open
}

// Meme entity (tenant 'e')
export interface Meme {
	s: 'e'; // tenant id for memes
	u?: string; // uploader user id
	l: string; // image link (R2 URL)
	p: number; // upvotes
	a?: string; // gemini-generated summary used for search/alt text
	d?: number; // created at timestamp
	r?: string; // associated chatroom id
}


// Preset type for /pink feature
export interface Preset {
	s: 'p'; // tenant id for preset
	i: string; // preset id
	n: string; // name
	p?: string; // prompt
	a?: string; // about
	d?: number; // created at timestamp
	x?: string[]; // image urls for preset (using x to avoid 'i' collision)
}

export interface Post {
	s: 'r'; // tenant for posts
	i: string; // post id
	m: string; // title
	b?: string; // body (markdown)
	y?: string; // summary
	p?: string; // image url
	u?: string; // user id
	a?: number; // created timestamp
}

export interface DescriptionInputProps {
	value?: string;
	editable?: boolean;
	endpoint?: string;
	placeholder?: string;
	rows?: number;
	label?: string;
}

export interface Recording {
	id: string; // recording id from RealtimeKit
	// Add fields like start_time, duration if needed for display
}

export interface Resume {
	s: 'e'; // tenant id
	u?: string; // user id
	h?: string; // html
	d?: number; // created
	l?: number; // last updated
}
