// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			env: {
				R: DurableObjectNamespace;
			};
		}
		interface Locals {
			user: User | null;
			session: Session | null
		}
	}
}
