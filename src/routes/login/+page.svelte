<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<main
	class="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-12"
>
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1
				class="text-2xl font-bold tracking-tight text-slate-900"
			>
				Login / Register
			</h1>
			<p class="mt-1 text-sm text-slate-600">
				Sign in with your username or continue with
				Google
			</p>
		</div>

		{#if form?.message}
			<div
				class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
			>
				{form.message}
			</div>
		{/if}

		<div
			class="rounded-xl border border-slate-200 bg-white/80 p-6 shadow-lg backdrop-blur"
		>
			<form
				method="post"
				action="?/login"
				use:enhance
				class="space-y-5"
				autocomplete="on"
				novalidate
			>
				<div>
					<label
						for="username"
						class="block text-sm font-medium text-slate-700"
						>Username</label
					>
					<input
						id="username"
						name="username"
						autocomplete="username"
						class="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div>
					<label
						for="password"
						class="block text-sm font-medium text-slate-700"
						>Password</label
					>
					<input
						id="password"
						type="password"
						name="password"
						autocomplete="current-password"
						class="mt-1 block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div class="grid grid-cols-2 gap-3">
					<button
						class="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
					>
						Login
					</button>
					<button
						formaction="?/register"
						class="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 font-medium text-slate-900 shadow-sm transition-colors hover:bg-slate-50 focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:outline-none"
					>
						Register
					</button>
				</div>
				<div class="pt-2">
					<a
						href="/google"
						class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2 font-medium text-white shadow-sm transition-colors hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
					>
						Continue with Google
					</a>
				</div>
			</form>
		</div>
	</div>
</main>
