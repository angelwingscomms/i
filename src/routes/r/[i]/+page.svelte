<script lang="ts">
	import { page } from '$app/stores';

	import { v7 } from 'uuid';
	import { fade } from 'svelte/transition';
	import type { SendChatMessage, ChatMessage } from '$lib/types'; // Import the new type
	import { toast } from '$lib/util/toast';
	import { PUBLIC_WORKER } from '$env/static/public';
	import axios from 'axios';
	import type { PageProps } from './$types';
	import anime from 'animejs/lib/anime.es.js';
	let { data }: PageProps = $props();

	let chat_messages: ChatMessage[] = $state(data.m);
	let message_text = $state('');
	let websocket: WebSocket | undefined;
	let messagesEl: HTMLElement | null = null;

	function animate_in(el: HTMLElement) {
		anime({
			targets: el,
			opacity: [0, 1],
			translateY: [8, 0],
			scale: [0.98, 1],
			easing: 'easeOutQuad',
			duration: 420
		});
	}

	function animate_in_list(container: HTMLElement) {
		const items = Array.from(container.querySelectorAll('.chat_item')).filter(
			(el) => !el.hasAttribute('data-animated')
		);
		if (!items.length) return;
		anime({
			targets: items,
			opacity: [0, 1],
			translateY: [8, 0],
			scale: [0.98, 1],
			easing: 'easeOutQuad',
			duration: 380,
			delay: anime.stagger(35)
		});
		items.forEach((el) => el.setAttribute('data-animated', '1'));
	}

	function observe_list(container: HTMLElement) {
		const mo = new MutationObserver(() => animate_in_list(container));
		mo.observe(container, { childList: true, subtree: true });
		return () => mo.disconnect();
	}

	$effect(() => {
		websocket = new WebSocket('ws' + PUBLIC_WORKER + '/' + $page.params.i);

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
			return () => stop();
		}
	});

	function send_message() {
		let m: SendChatMessage = {
			t: message_text,
			d: Date.now(),
			i: v7()
		};
		if (message_text) {
			chat_messages.push({ ...m, u: data.user.t, saved: false });
			message_text = '';
			axios.post($page.url.pathname, m);
		}
	}
</script>

<div class="chat-layout">
	<h1 class="chat-title">{data.t}</h1>
	<div class="messages-container" bind:this={messagesEl}>
		{#each chat_messages as msg (msg.i)}
			<div
				class="chat_item"
				in:fade={{ duration: 150, delay: 0 }}
				out:fade={{ duration: 150 }}
				data-msg-id={msg.i}
			>
				<div class="chat_meta">
					{#if msg.u}
						<div class="chat_username">{msg.u}</div>
					{:else}
						<div class="chat_username chat_username--anon">Anonymous</div>
					{/if}
				</div>
				<div
					class={`chat_bubble ${msg.u ? '' : 'chat_bubble--anon'} ${msg.saved ? '' : 'chat_bubble--pending'}`}
				>
					<span class="message-text">{msg.t}</span>
				</div>
			</div>
		{/each}
	</div>
	<div class="input-area">
		<input
			type="text"
			class="message-input"
			bind:value={message_text}
			on:keydown={(e) => e.key === 'Enter' && send_message()}
			placeholder="Type a message..."
		/>
		<button class="send-button" on:click={send_message}>Send</button>
	</div>
</div>
