import type { PushSubscription } from "web-push";

export interface User {
	s: 'u';
	g: string; // google id
  n: string; // google name
}

export interface NotificationSubscription {
	s: 'n'; // tenant id for notification subscriptions
	u: string; // user uuid
	sub: PushSubscription
}
