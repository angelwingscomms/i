<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';
	import type { PageData } from './$types';

	let { data } = $props<{ data: PageData }>();
	let password = $state('');
	let confirm = $state('');
	let submitting = $state(false);
	let message = $state('');

	function validate_password(value: string) {
		return value.length >= 6 && value.length <= 255;
	}

	async function submit() {
		message = '';
		if (!validate_password(password)) {
			message = 'password must be between 6 and 255 characters';
			return;
		}
		if (password !== confirm) {
			message = 'passwords do not match';
			return;
		}
		submitting = true;
		try {
			const response = await fetch('', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});
			const result = await response.json();
			message = result.error || result.message || '';
			if (result.redirect) {
				window.location.href = result.redirect;
			}
		} catch (err) {
			console.error(err);
			message = 'failed to reset password';
		} finally {
			submitting = false;
		}
	}
</script>

<main class="flex min-h-screen items-center justify-center px-4 py-12">
	<div class="w-full max-w-md">
		<header class="mb-8 text-center">
			<h1 class="text-2xl font-bold tracking-tight text-purple-500">
				set a new password
			</h1>
			<p class="mt-1 text-sm text-slate-600">
				resetting password for {data.email}
			</p>
		</header>

		<div class="rounded-xl p-6 shadow-lg backdrop-blur">
			<form
				onsubmit={(e) => {
					e.preventDefault();
					submit();
				}}
				class="space-y-5"
				novalidate
			>
				<DescriptionInput
					bind:value={password}
					label="password"
					type="password"
					id="password"
					name="password"
					placeholder="enter password"
					voice_typing={false}
				/>

				<DescriptionInput
					bind:value={confirm}
					label="confirm password"
					type="password"
					id="confirm"
					name="confirm"
					placeholder="confirm password"
					voice_typing={false}
				/>

				<Button
					text="update password"
					variant="primary"
					wide
					loading={submitting}
				/>
			</form>
		</div>

		{#if message}
			<p class="mt-4 text-center text-sm text-slate-500">
				{message}
			</p>
		{/if}
	</div>
</main>
