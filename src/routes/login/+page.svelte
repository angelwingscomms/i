<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';
	import Button from '$lib/components/Button.svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';

	let { form }: { form: ActionData } = $props();

	let username = $state('');
	let password = $state('');
</script>

<main class="flex min-h-screen items-center justify-center px-4 py-12">
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1 class="text-2xl font-bold tracking-tight text-purple-500">login / register</h1>
			<p class="mt-1 text-sm text-slate-600">sign in with your username or continue with google</p>
		</div>

		{#if form?.message}
			<div class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
				{form.message}
			</div>
	
			<div class="mt-4 text-center">
				<Button href="/google" text="continue with google" variant="primary" wide icon="fab fa-google" />
			</div>
		{/if}

		<div class="rounded-xl p-6 shadow-lg backdrop-blur">
			<form method="post" use:enhance class="space-y-5" autocomplete="on" novalidate>
				<DescriptionInput
					bind:value={username}
					label="username"
					id="username"
					name="username"
					placeholder="enter username"
					voice_typing={false}
					autocomplete="username"
				/>

				<DescriptionInput
					bind:value={password}
					label="password"
					id="password"
					name="password"
					type="password"
					placeholder="enter password"
					voice_typing={false}
					autocomplete="current-password"
				/>

				<div class="grid grid-cols-2 gap-3">
					<Button text="login" variant="primary" wide />
					<Button text="register" variant="secondary" wide formaction="?/register" />
				</div>

			</form>
		</div>
	</div>
</main>
