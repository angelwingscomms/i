<script lang="ts">
	import { page } from '$app/state';
	import { v7 } from 'uuid';
	import { fade } from 'svelte/transition';
	import type { SendChatMessage, ChatMessage } from '$lib/types'; // Import the new type
	import { toast } from '$lib/util/toast';
	import { PUBLIC_WORKER } from '$env/static/public';
	import axios from 'axios';
	import { animate, stagger } from 'animejs';
	import { tick } from 'svelte';
	let {
		m,
		s,
		c,
		t,
		r,
		a,
		children
	}: { m: ChatMessage[]; s: string; c: string; t: string; r: boolean; children?: any; a: boolean } =
		$props();

	let chat_messages: ChatMessage[] = $state(m);
	let message_text = $state('');
	let websocket: WebSocket | undefined;
	let messagesEl: HTMLElement | null = null;
	let messageInputEl: HTMLInputElement | null = null;

	// function animate_in(el: HTMLElement) {
	// 	animate(el, {
	// 		opacity: [0, 1],
	// 		translateY: [8, 0],
	// 		scale: [0.98, 1],
	// 		easing: 'easeOutQuad',
	// 		duration: 420
	// 	});
	// }

	function animate_in_list(container: HTMLElement) {
		const items = Array.from(container.querySelectorAll('.chat_item')).filter(
			(el) => !el.hasAttribute('data-animated')
		);
		if (!items.length) return;
		animate(items, {
			opacity: [0, 1],
			translateY: [8, 0],
			scale: [0.72, 1],
			easing: 'easeOutQuad',
			duration: 380,
			delay: stagger(35)
		});
		items.forEach((el) => el.setAttribute('data-animated', '1'));
		// ensure scroll to bottom after new items animate in
		container.scrollTop = container.scrollHeight;
	}

	function observe_list(container: HTMLElement) {
		const mo = new MutationObserver(() => animate_in_list(container));
		mo.observe(container, { childList: true, subtree: true });
		return () => mo.disconnect();
	}

	$effect(() => {
		console.log('c', c);
		websocket = new WebSocket('ws' + PUBLIC_WORKER + '/' + c + s);

		websocket.onopen = () => {
			console.log('WebSocket connection opened.');
		};

		// Listen for messages
		websocket.onmessage = (event) => {
			console.log('event', event);
			try {
				const message: ChatMessage = JSON.parse(event.data);
				let sent_message = chat_messages.find((m) => m.i === message.i);
				if (sent_message) {
					sent_message.saved = true;
				} else {
					chat_messages = [...chat_messages, { ...message, saved: true }];
				}
			} catch (e) {
				console.error('Error parsing message data', e);
				toast.error('Error receiving message.');
			}
		};

		// Connection closed
		websocket.addEventListener('close', (event) => {
			console.log('WebSocket connection closed.', event.code, event.reason);
			toast.error('Chat connection lost.');
		});

		// Connection error
		websocket.addEventListener('error', (err) => {
			console.error('WebSocket error:', err);
			toast.error('WebSocket error.');
		});

		return () => {
			if (websocket) {
				websocket.close();
				websocket = undefined; // Clear the socket reference
			}
		};
	});

	$effect(() => {
		if (messagesEl) {
			animate_in_list(messagesEl);
			const stop = observe_list(messagesEl);
			// initial scroll to bottom to show latest messages fully
			messagesEl.scrollTop = messagesEl.scrollHeight;
			return () => stop();
		}
		// focus input on mount
		tick().then(() => messageInputEl?.focus());
	});

	function send_message() {
		let m: SendChatMessage = {
			m: message_text,
			c,
			t,
			d: Date.now(),
			i: v7(),
			a
		};
		if (message_text) {
			chat_messages.push({ m: m.m, i: m.i, x: page.data.user.t, saved: false });
			message_text = '';
			console.log(page.url.pathname);
			axios.post(page.url.pathname, m);
		}
	}
</script>

<div class="chat-layout">
	<div class="chat-header">
		<h1 class="chat-title">{t}</h1>
		{#if children}{@render children()}{/if}
	</div>
	<div class="messages-container" bind:this={messagesEl}>
		{#each chat_messages as msg, i (msg.i)}
			{#if r}
				<a
					class="chat_item"
					in:fade={{ duration: 150, delay: 0 }}
					out:fade={{ duration: 150 }}
					href={page.url.pathname.split('/').slice(0, -1).join('/') + '/' + msg.i}
					data-msg-id={msg.i}
					style={`align-items:${msg.x === page.data.user?.t ? 'flex-end' : 'flex-start'}`}
				>
					<div
						class="chat_meta"
						style={`justify-content:${msg.x === page.data.user?.t ? 'flex-end' : 'flex-start'}`}
					>
						{#if msg.x && msg.x !== page.data.user?.t && chat_messages[i - 1]?.x !== msg.x}
							<div class="chat_username">{msg.x}</div>
						{/if}
					</div>
					<div
						class={`chat_bubble ${msg.x === page.data.user?.t ? 'chat_bubble--self' : ''} ${msg.x ? '' : 'chat_bubble--anon'} ${msg.saved ? '' : 'chat_bubble--pending'}`}
						style={`max-width: 90%; ${msg.x === page.data.user?.t ? 'margin-left:auto;' : 'margin-right:auto;'}`}
					>
						<span class="message-text">{msg.m}</span>
					</div>
				</a>
			{:else}
				<div
					class="chat_item"
					in:fade={{ duration: 150, delay: 0 }}
					out:fade={{ duration: 150 }}
					data-msg-id={msg.i}
					style={`align-items:${msg.x === page.data.user?.t ? 'flex-end' : 'flex-start'}`}
				>
					<div
						class="chat_meta"
						style={`justify-content:${msg.x === page.data.user?.t ? 'flex-end' : 'flex-start'}`}
					>
						{#if msg.x && msg.x !== page.data.user?.t && chat_messages[i - 1]?.x !== msg.x}
							<div class="chat_username">{msg.x}</div>
						{/if}
					</div>
					<div
						class={`chat_bubble ${msg.x === page.data.user?.t ? 'chat_bubble--self' : ''} ${msg.x ? '' : 'chat_bubble--anon'} ${msg.saved ? '' : 'chat_bubble--pending'}`}
						style={`max-width: 90%; ${msg.x === page.data.user?.t ? 'margin-left:auto;' : 'margin-right:auto;'}`}
					>
						<span class="message-text">{msg.m}</span>
					</div>
				</div>
			{/if}
		{/each}
	</div>
	<div class="input-area">
		<input
			type="text"
			class="message-input ghost-border"
			bind:value={message_text}
			bind:this={messageInputEl}
			onkeydown={(e) => e.key === 'Enter' && send_message()}
			placeholder="Type a message..."
		/>
		<button
			aria-label="send"
			class="send-button"
			style="color: var(--color-theme-2);"
			onclick={() => (a = !a)}><i class="fa-solid fa-ghost"></i></button
		><button
			aria-label="send"
			class="send-button"
			style="color: var(--color-theme-2);"
			onclick={send_message}><i class="fa-solid fa-paper-plane"></i></button
		>
	</div>
</div>
