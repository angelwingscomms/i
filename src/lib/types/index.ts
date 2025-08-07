import type { PushSubscription } from 'web-push';

export interface User {
	s?: string;
	t: string; // tag
	d?: string; // description
	a?: number; // age
	g?: number; // gender, 0 is male, 1 is female
	l?: number; // latitude
	n?: number; // longitude
	w?: string; // whatsapp link
	gid?: string; // google id
	p?: string; // password hash
	i?: string; // user id
	c: Record<string, string>,
	x?: string[]; // contact links
	isAdmin?: boolean; // whether user is an admin
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

export interface CreateChatMessage {
	s?: 'm'; // tenant id for messages
	u?: string; // user ID
	t: string; // message text
	d: number; // date
	r: string; // room ID
}

export interface SendChatMessage {
  i: string; // id
	t: string; // message text
	d: number; // date
}

// used for messages shown in UI
export interface ChatMessage {
  saved: true, // if client has received websocket event for this message, meaning message has been saved to db
  i: string, //id
  u: string, // user tag,
  t: string, // message text
}

export interface Room {
	i: string; // room id
	t: string; // room tag/name
	d?: string; // room description
	u: string; // creator user id
  c: string; // cloudflare id
	a?: string; // creation timestamp
	m?: number; // number of members
  l?: number; // time of last message
}
