<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';

	let email = $state('');
	let submitting = $state(false);
	let message = $state('');

	function validate_email(value: string) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
			value.trim()
		);
	}

	async function submit_request() {
		message = '';
		if (!validate_email(email)) {
			message = 'enter a valid email';
			return;
		}
		submitting = true;
		try {
			const res = await fetch('/reset', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email })
			});
			const data = await res.json();
			message = data.error || data.message || '';
		} catch (err) {
			console.error(err);
			message = 'failed to send reset email';
		} finally {
			submitting = false;
		}
	}
</script>

<main
	class="flex min-h-screen items-center justify-center px-4 py-12"
>
	<div class="w-full max-w-md">
		<header class="mb-8 text-center">
			<h1
				class="text-2xl font-bold tracking-tight text-purple-500"
			>
				reset password
			</h1>
			<p class="mt-1 text-sm text-slate-600">
				enter the email on your account to get a reset
				link
			</p>
		</header>

		<div
			class="rounded-xl p-6 shadow-lg backdrop-blur"
		>
			<form
				onsubmit={(e) => {
					e.preventDefault();
					submit_request();
				}}
				class="space-y-5"
				novalidate
			>
				<DescriptionInput
					bind:value={email}
					label="email"
					id="reset-email"
					name="email"
					type="email"
					placeholder="enter email"
					voice_typing={false}
				/>

				<Button
					text="send reset link"
					variant="primary"
					wide
					loading={submitting}
				/>
			</form>
		</div>

		{#if message}
			<p
				class="mt-4 text-center text-sm text-slate-500"
			>
				{message}
			</p>
		{/if}
	</div>
</main>
