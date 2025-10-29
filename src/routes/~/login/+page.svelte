<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';

let mode = $state<'login' | 'register'>('login');
let login_identifier = $state('');
let login_password = $state('');
let register_username = $state('');
let register_email = $state('');
let register_password = $state('');
let error = $state('');
let logging_in = $state(false);
let registering = $state(false);

function validate_email(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

async function submitLogin() {
	if (!login_identifier || !login_password) return;
	logging_in = true;
	error = '';
	try {
		const response = await fetch('/~/login', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				identifier: login_identifier,
				password: login_password
			})
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

async function submitRegister() {
	if (!register_username || !register_password) return;
	if (!register_email || !validate_email(register_email)) {
		error = 'enter a valid email';
		return;
	}
	registering = true;
	error = '';
	try {
		const response = await fetch('/~/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: register_username,
				password: register_password,
				email: register_email
			})
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

function handleLogin() {
	if (mode === 'register') {
		mode = 'login';
		error = '';
		registering = false;
		return;
	}
	submitLogin();
}

function handleRegister() {
	if (mode === 'login') {
		mode = 'register';
		error = '';
		logging_in = false;
		return;
	}
	submitRegister();
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
				sign in with your username 
				<!-- or continue with
				google -->
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
				onsubmit={(e) => e.preventDefault()}
				class="space-y-5"
				autocomplete="on"
				novalidate
			>
				{#if mode === 'login'}
					<DescriptionInput
						bind:value={login_identifier}
						label="username or email"
						id="login-identifier"
						name="identifier"
						placeholder="enter username or email"
						voice_typing={false}
						autocomplete="username"
						disabled={logging_in}
					/>

					<DescriptionInput
						bind:value={login_password}
						label="password"
						id="login-password"
						name="password"
						type="password"
						placeholder="enter password"
						voice_typing={false}
						autocomplete="current-password"
						disabled={logging_in}
					/>
				{:else}
					<DescriptionInput
						bind:value={register_username}
						label="username"
						id="register-username"
						name="username"
						placeholder="enter username"
						voice_typing={false}
						autocomplete="username"
						disabled={registering}
					/>

					<DescriptionInput
						bind:value={register_email}
						label="email"
						id="register-email"
						name="email"
						type="email"
						placeholder="enter email"
						voice_typing={false}
						autocomplete="email"
						disabled={registering}
					/>

					<DescriptionInput
						bind:value={register_password}
						label="password"
						id="register-password"
						name="password"
						type="password"
						placeholder="enter password"
						voice_typing={false}
						autocomplete="new-password"
						disabled={registering}
					/>
				{/if}

				<div class="grid grid-cols-3 gap-3">
					<Button
						text={mode === 'register' ? 'login instead' : 'login'}
						variant="primary"
						loading={mode === 'login' ? logging_in : false}
						onclick={handleLogin}
					/>
					<Button
						text={mode === 'login' ? 'register instead' : 'register'}
						variant="secondary"
						loading={mode === 'register' ? registering : false}
						onclick={handleRegister}
					/>
					<Button
						href="/~/reset"
						text="forgot password"
						variant="secondary"
					/>
				</div>
			</form>
		</div>

		<!-- <div class="mt-4 text-center">
			<Button
				href="/~/google"
				text="continue with google"
				variant="primary"
				wide
				icon="fab fa-google"
			/>
		</div> -->
	</div>
</main>
