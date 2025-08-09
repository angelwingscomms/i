import type { PushSubscription } from 'web-push';

export interface LocalsUser {
	t: string;
	i: string;
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
	c: Record<string, string>;
	x?: string[]; // contact links
	isAdmin?: boolean; // whether user is an admin
  	ps?: PushSubscription; // push subscription
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

export type DBChatMessage = Pick<Message, 's' | 'u' | 'm' | 'd' | 'r'>

export type SendChatMessage = Pick<Message, 'saved' | 'm' | 'i' | 'c' | 'd' | 't'>

export type ChatMessage = Pick<Message, 'saved' | 'm' | 'i' | 'x'>

export interface Message {
	saved?: boolean; // if client has received websocket event for this message, meaning message has been saved to db
	m: string; // message
	i: string; //id
	x?: string; // sender user tag,
	d: number; // date
	c: string; // cf id
	t: string; // receiving room/user tag
	s?: 'm'; // tenant id for messages
	u?: string; // user ID
	r: string; // room ID
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
