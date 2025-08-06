<script lang="ts">
	import { page } from '$app/stores';

	import { v7 } from 'uuid';
	import { fade } from 'svelte/transition';
	import type { ChatMessage } from '$lib/types'; // Import the new type
	import { toast } from '$lib/util/toast';
	import { PUBLIC_WORKER } from '$env/static/public';
	import axios from 'axios';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();

	let chat_messages: ChatMessage[] = $state(data.m);
	let message_text = $state('');
	let websocket: WebSocket | undefined;
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
				chat_messages = [...chat_messages, message];
				console.log(chat_messages);
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
	// Simple random user ID. In a real app, this would come from user authentication (e.g., locals.user.u)
	// For this example, we'll use a random one, but the +server.js uses the authenticated user's ID.

	const chat_id = $page.params.i;

	function send_message() {
		const m: ChatMessage = {
			u: $page.data.user ? $page.data.user.i : '',
			mt: message_text,
			ut: $page.data.user ? $page.data.user.t : '',
			i: v7()
		};
		if (message_text) {
			if (websocket) websocket.send(JSON.stringify(m));
			axios.post($page.data.pathname, m);
			message_text = '';
		}
	}
</script>

<div class="chat-layout">
	<h1 class="chat-title">Chat Room: {chat_id}</h1>
	<div class="messages-container">
		{#each chat_messages as msg (msg.i)}
			//TODO
			<div class="message-item" in:fade={{ duration: 150, delay: 0 }} out:fade={{ duration: 150 }}>
				{#if msg.u === 'system'}
					<em class="message-system text-white">{msg.mt}</em>
				{:else}
					<strong class="message-user text-blue-300">{msg.ut}:</strong>
					<span class="message-text">{msg.mt}</span>
				{/if}
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
