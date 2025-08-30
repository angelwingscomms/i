// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { LocalsUser } from '$lib/types';
import type { Session } from '@supabase/supabase-js';

declare global {
	namespace App {
		interface Platform {
			env: {
				r: DurableObjectNamespace;
			};
		}
		interface Locals {
			user: LocalsUser | null;
			session: Session | null;
		}
	}
}
export {};
