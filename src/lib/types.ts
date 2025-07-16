import type { PushSubscription } from 'web-push';

export interface User {
	s: 'u';
	t: string; // tag
	d: string; // description
	a: number; // age
	g: number; // gender, 0 is male, 1 is female
	l: number; // latitude
	n: number; // longitude
	w: string; // whatsapp link
	gid: string; // google id
}

export interface NotificationSubscription {
	s: 'n'; // tenant id for notification subscriptions
	u: string; // user uuid
	sub: PushSubscription;
}
