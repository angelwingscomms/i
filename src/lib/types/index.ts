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

export interface ChatMessage {
	s: 'm'; // tenant id for messages
	u: string; // user ID
	t: string; // message text
	ts: string; // timestamp
	r: string; // room ID
}
