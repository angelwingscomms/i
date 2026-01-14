export interface Desire {
	s: 'd'; // tenant id for desires
	i: string[]; // user ids (2 users)
	d: string[]; // desires strings, corresponding to user ids in .i
	u: string; // current user id (must be in .i to access)
}