<script lang="ts">
	import { onMount } from 'svelte';
	import {
		create_granite_client,
		supports_webgpu,
		type GraniteMessage
	} from '$lib/util/granite/client';

	const system_message: GraniteMessage = {
		role: 'system',
		content:
			'you are granite 4.0 350m running entirely in the browser. always reply clearly and keep answers concise.'
	};

	const client = create_granite_client();

	let chat_messages = $state<GraniteMessage[]>([
		system_message
	]);
	let input_text = $state('');
	let is_loading_model = $state(false);
	let is_ready = $state(false);
	let is_generating = $state(false);
	let load_progress = $state(0);
	let load_error = $state('');

	const visible_messages = $derived(
		chat_messages.filter(
			(message) => message.role !== 'system'
		)
	);

	let chat_container = $state<HTMLDivElement | null>(
		null
	);

	const set_error = (value: unknown) => {
		if (!value) {
			load_error = '';
			return;
		}
		if (value instanceof Error) {
			load_error = value.message.toLowerCase();
			return;
		}
		load_error = String(value).toLowerCase();
	};

	const reset_chat = () => {
		chat_messages = [system_message];
		client.reset();
		load_error = '';
	};

	onMount(async () => {
		if (!supports_webgpu()) {
			set_error(
				'webgpu is not available in this browser'
			);
			return;
		}
		is_loading_model = true;
		load_progress = 0;
		try {
			await client.load({
				on_progress: (value) => {
					load_progress = value;
				}
			});
			is_ready = true;
			load_error = '';
		} catch (error) {
			set_error(error);
		} finally {
			is_loading_model = false;
		}
	});

	$effect(() => {
		chat_messages;
		const node = chat_container;
		if (!node) return;
		node.scrollTop = node.scrollHeight;
	});

	const send_message = async () => {
		const trimmed = input_text.trim();
		if (!trimmed || !is_ready || is_generating)
			return;
		input_text = '';
		load_error = '';
		is_generating = true;

		const pending_messages = [
			...chat_messages,
			{ role: 'user', content: trimmed }
		];
		chat_messages = [
			...pending_messages,
			{ role: 'assistant', content: '' }
		];
		const reply_index = chat_messages.length - 1;
		let streamed = '';
		try {
			const response = await client.generate(
				pending_messages,
				{
					on_token: (token) => {
						streamed += token;
						chat_messages = chat_messages.map(
							(message, index) =>
								index === reply_index
									? { ...message, content: streamed }
									: message
						);
					}
				}
			);
			chat_messages = chat_messages.map(
				(message, index) =>
					index === reply_index
						? { ...message, content: response }
						: message
			);
		} catch (error) {
			set_error(error);
			chat_messages = chat_messages.slice(
				0,
				reply_index
			);
		} finally {
			is_generating = false;
		}
	};

	const handle_submit = (event: SubmitEvent) => {
		event.preventDefault();
		send_message();
	};

	const handle_key = (event: KeyboardEvent) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			send_message();
		}
	};
</script>

<main
	class="min-h-screen bg-[color:var(--bg-primary)] px-4 py-12"
>
	<div class="mx-auto flex max-w-5xl flex-col gap-6">
		<section class="space-y-2 text-center">
			<h1
				class="text-3xl font-semibold text-[color:var(--text-primary)]"
			>
				granite in-browser chat
			</h1>
			<p
				class="text-sm text-[color:var(--text-secondary)]"
			>
				granite 4.0 350m instruct quantized for
				webgpu, running fully on the client
			</p>
		</section>

		{#if load_error}
			<div
				class="rounded-xl border border-[color:var(--border-primary)] bg-[color:var(--bg-card)] px-4 py-3 text-sm text-[color:var(--text-error)]"
			>
				{load_error}
			</div>
		{/if}

		<section
			class="flex min-h-[60vh] flex-col gap-4 rounded-3xl border border-[color:var(--border-secondary)] bg-[color:var(--bg-card)] p-6 shadow-[var(--shadow-lg)]"
		>
			{#if !is_ready}
				<div
					class="flex flex-1 flex-col items-center justify-center gap-3 text-center"
				>
					<p
						class="text-base text-[color:var(--text-secondary)]"
					>
						{supports_webgpu()
							? 'loading granite weights'
							: 'webgpu support required'}
					</p>
					{#if is_loading_model}
						<div
							class="w-full max-w-xs overflow-hidden rounded-full border border-[color:var(--border-primary)]"
						>
							<div
								class="h-2 bg-[color:var(--accent-primary)] transition-all"
								style={`width: ${load_progress}%`}
							></div>
						</div>
					{/if}
					{#if load_error && supports_webgpu()}
						<button
							onclick={() => {
								reset_chat();
								is_ready = false;
								is_loading_model = true;
								load_progress = 0;
								client
									.load({
										on_progress: (value) => {
											load_progress = value;
										}
									})
									.then(() => {
										is_ready = true;
										load_error = '';
									})
									.catch((error) => set_error(error))
									.finally(() => {
										is_loading_model = false;
									});
							}}
							class="rounded-full bg-[color:var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white"
						>
							retry load
						</button>
					{/if}
				</div>
			{:else}
				<div class="flex flex-1 flex-col gap-4">
					<div
						bind:this={chat_container}
						class="flex-1 space-y-4 overflow-y-auto rounded-2xl border border-[color:var(--border-primary)] bg-[color:var(--bg-glass)] p-4"
					>
						{#if visible_messages.length === 0}
							<p
								class="text-center text-sm text-[color:var(--text-secondary)]"
							>
								say hi to granite
							</p>
						{:else}
							{#each visible_messages as message, index (index)}
								<div
									class={message.role === 'user'
										? 'flex justify-end'
										: 'flex justify-start'}
								>
									<div
										class={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
											message.role === 'user'
												? 'bg-[color:var(--accent-primary)] text-white'
												: 'bg-[color:var(--bg-secondary)] text-[color:var(--text-primary)]'
										}`}
									>
										{message.content}
									</div>
								</div>
							{/each}
						{/if}
					</div>
					<form
						class="flex items-end gap-3"
						onsubmit={handle_submit}
					>
						<textarea
							bind:value={input_text}
							class="min-h-[3rem] flex-1 resize-none rounded-2xl border border-[color:var(--border-primary)] bg-[color:var(--bg-input)] px-4 py-3 text-sm text-[color:var(--text-primary)] outline-none focus:border-[color:var(--border-focus)]"
							placeholder="ask granite anything"
							onkeydown={handle_key}
							disabled={is_generating}
						></textarea>
						<button
							type="submit"
							disabled={is_generating}
							class="h-11 rounded-full bg-[color:var(--accent-primary)] px-5 text-sm font-semibold text-white disabled:opacity-60"
						>
							send
						</button>
						<button
							type="button"
							onclick={reset_chat}
							disabled={is_generating}
							class="h-11 rounded-full border border-[color:var(--accent-primary)] px-5 text-sm font-semibold text-[color:var(--accent-primary)] disabled:opacity-60"
						>
							clear
						</button>
					</form>
				</div>
			{/if}
		</section>
	</div>
</main>
