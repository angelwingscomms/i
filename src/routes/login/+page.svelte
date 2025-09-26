<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';

	let username = $state('');
	let password = $state('');
	let error = $state('');
	let logging_in = $state(false);
	let registering = $state(false);

	async function handleLogin() {
		if (!username || !password) return;
		logging_in = true;
		error = '';
		try {
			const response = await fetch('/login', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			});
			const data = await response.json();
			if (data.error) {
				error = data.error;
			} else if (data.success) {
				goto(data.redirect);
			}
		} catch (e) {
			error = 'An error occurred';
		} finally {
			logging_in = false;
		}
	}

	async function handleRegister() {
		if (!username || !password) return;
		registering = true;
		error = '';
		try {
			const response = await fetch('/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			});
			const data = await response.json();
			if (data.error) {
				error = data.error;
			} else if (data.success) {
				goto(data.redirect);
			}
		} catch (e) {
			error = 'An error occurred';
		} finally {
			registering = false;
		}
	}
</script>

<main
	class="flex min-h-screen items-center justify-center px-4 py-12"
>
	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1
				class="text-2xl font-bold tracking-tight text-purple-500"
			>
				login / register
			</h1>
			<p class="mt-1 text-sm text-slate-600">
				sign in with your username or continue with
				google
			</p>
		</div>

		{#if error}
			<div
				class="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
			>
				{error}
			</div>
		{/if}

		<div
			class="rounded-xl p-6 shadow-lg backdrop-blur"
		>
			<form
				on:submit|preventDefault
				class="space-y-5"
				autocomplete="on"
				novalidate
			>
				<DescriptionInput
					bind:value={username}
					label="username"
					id="username"
					name="username"
					placeholder="enter username"
					voice_typing={false}
					autocomplete="username"
					disabled={logging_in || registering}
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
					disabled={logging_in || registering}
				/>

				<div class="grid grid-cols-2 gap-3">
					<Button
						text="login"
						variant="primary"
						wide
						loading={logging_in}
						onclick={handleLogin}
					/>
					<Button
						text="register"
						variant="secondary"
						wide
						loading={registering}
						onclick={handleRegister}
					/>
				</div>
			</form>
		</div>

		<div class="mt-4 text-center">
			<Button
				href="/google"
				text="continue with google"
				variant="primary"
				wide
				icon="fab fa-google"
			/>
		</div>
	</div>
</main>
