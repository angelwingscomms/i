import type { PushSubscription } from "web-push";

export interface User {
	s: 'u';
	u: string; // usertag
	g: string; // google id
	id?: string;
}

export interface NotificationSubscription {
	s: 'n'; // tenant id for notification subscriptions
	u: string; // user uuid
	sub: PushSubscription
}
