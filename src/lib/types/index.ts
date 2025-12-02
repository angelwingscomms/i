import type { PushSubscription } from 'web-push';

export interface LocalsUser {
	t: string;
	i: string;
	d?: string;
	av?: string;
	a?: number;
	g?: number;
	p?: string;
}

export interface User {
	s: string; // type/tenant (e.g., 'u' user, 'se' session, 'm' message, 'n' notif sub)
	t: string; // tag
	av?: string; // avatar data url or external url
	d?: string; // description
	m?: string; // name
	a?: number; // age
	g?: number; // gender, 0 is male, 1 is female
	l?: number; // latitude
	n?: number; // longitude
	w?: string; // whatsapp link
	y?: boolean; // show age on profile
	o?: boolean; // show gender on profile
	ke?: boolean; // show emails on profile
	z?: string[]; // zones
	p?: string; // password hash
	i?: string; // user id
	dc?: number; // date created
	on?: number; // last online timestamp (ms)
	ic?: boolean; // currently in call
	r?: string[]; // rooms the user belongs to
	ev?: string[]; // events the user joined
	c?: string[]; // color palette hex without #
	// c: Record<string, string>;
	x?: string[]; // contact links,
	b?: string[]; // phone numbers
	k?: string[]; // emails
	rt?: string; // realtime room token
	isAdmin?: boolean; // whether user is an admin
	ps?: PushSubscription[]; // push subscription
	e?: string; // email
	pe?: number; // password reset expiry timestamp
	pt?: string; // password reset token hash
	pr?: number; // password reset request timestamp
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

export type DBChatMessage = Pick<
	Message,
	's' | 'u' | 'm' | 'd' | 'r' | 'q'
>;

// Client-to-server payload when sending a chat message. "a" is an optional
// flag used by anon rooms; it is not part of the persisted Message payload.
export type SendChatMessage = Pick<
	Message,
	'saved' | 'm' | 'i' | 'd' | 't' | 'f'
> & { a?: string; _?: string };

export type ChatMessage = Pick<
	Message,
	'saved' | 'm' | 'i' | 'x' | 'f' | 'u'
>;

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
	s: 'p'; // tenant for posts
	i?: string; // post id
	t?: string; // title
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
	f?: string; // parent post id
}

export interface Recording {
	id: string; // recording id from RealtimeKit
	// Add fields like start_time, duration if needed for display
}

export interface World {
	s: 'w';
	i?: string;
	u: string;
	n: string;
	a?: string;
	j?: Record<string, unknown>;
	d: number;
	l?: number;
}

export interface Character {
	s: 'wc';
	i?: string;
	u: string;
	w: string;
	n: string;
	a?: string;
	j?: Record<string, unknown>;
	d: number;
	l?: number;
}

export interface Environment {
	s: 'we';
	i?: string;
	u: string;
	w: string;
	n: string;
	a?: string;
	j?: Record<string, unknown>;
	d: number;
	l?: number;
}

export type { Resume } from './resume';
export type { Zone } from './zone';
export type {
	SyncProject,
	SyncAudioMeta,
	SyncGenerated
} from './sync';
export type { DiaryEntry } from './diary';
export type { Event } from './event';
