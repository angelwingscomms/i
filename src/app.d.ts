import type { LocalsUser } from '$lib/types';

declare global {
	namespace App {
		interface Platform {
			env: {
				r: DurableObjectNamespace;
				R2: R2Bucket;
			};
		}
		interface Locals {
			user: LocalsUser | null;
			session: Session | null;
		}
	}
}
export {};
