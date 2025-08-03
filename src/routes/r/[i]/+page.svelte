<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import type { ChatMessage } from '$lib/types'; // Import the new type
	import { toast } from '$lib/util/toast';

	let chat_messages: ChatMessage[] = [];
	let message_text = '';
	let web_socket: WebSocket | undefined;
	// Simple random user ID. In a real app, this would come from user authentication (e.g., locals.user.u)
	// For this example, we'll use a random one, but the +server.js uses the authenticated user's ID.
	let user_id = 'user_' + Math.random().toString(16).slice(2);

	const chat_id = $page.params.id;

	// Function to fetch chat history (will be called onMount)
	async function fetch_chat_history() {
		try {
			// In a real SvelteKit app, you'd use a `+page.server.ts` load function
			// or a +server.ts API endpoint to fetch history.
			// For this example, we'll simulate it by calling a server endpoint.
			// However, since `get_chat_history` is a server-side DB function,
			// we need a +server.js endpoint to expose it.
			const response = await fetch(`/api/chat-history/${chat_id}`);
			if (!response.ok) {
				throw new Error('Failed to fetch chat history');
			}
			const history: ChatMessage[] = await response.json();
			chat_messages = history;
			toast.success('Chat history loaded.');
		} catch (error) {
			console.error('Error fetching chat history:', error);
			toast.error('Failed to load chat history.');
		}
	}

	onMount(() => {
		// Fetch chat history when the component mounts
		fetch_chat_history();

		// Determine the WebSocket protocol
		const ws_protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
		// The +server.js will get the user_id from locals.user, so passing it here might be redundant
		// but useful for local testing or if authentication is not fully set up yet.
		const ws_url = `${ws_protocol}//${location.host}/r/${chat_id}`;

		// Create WebSocket connection.
		web_socket = new WebSocket(ws_url);

		// Connection opened
		web_socket.addEventListener('open', () => {
			console.log('WebSocket connection opened.');
		});

		// Listen for messages
		web_socket.addEventListener('message', (event) => {
			try {
				const message: ChatMessage = JSON.parse(event.data);
				chat_messages = [...chat_messages, message];
			} catch (e) {
				console.error('Error parsing message data', e);
				toast.error('Error receiving message.');
			}
		});

		// Connection closed
		web_socket.addEventListener('close', (event) => {
			console.log('WebSocket connection closed.', event.code, event.reason);
			chat_messages = [
				...chat_messages,
				{
					u: 'system',
					t: 'Connection lost. Please refresh.',
					ts: new Date().toISOString(),
					r: chat_id,
					s: 'm'
				}
			];
			toast.error('Chat connection lost.');
		});

		// Connection error
		web_socket.addEventListener('error', (err) => {
			console.error('WebSocket error:', err);
			toast.error('WebSocket error.');
		});

		return () => {
			if (web_socket) {
				web_socket.close();
				web_socket = undefined; // Clear the socket reference
			}
		};
	});

	function send_message() {
		if (message_text && web_socket && web_socket.readyState === WebSocket.OPEN) {
			web_socket.send(message_text);
			message_text = '';
		} else if (web_socket && web_socket.readyState !== WebSocket.OPEN) {
			toast.error('Cannot send message: WebSocket is not open.');
		}
	}
</script>

<div class="chat-layout">
	<h1 class="chat-title">Chat Room: {chat_id}</h1>
	<div class="messages-container">
		{#each chat_messages as msg (msg.ts + msg.u)}
			<div class="message-item" in:fade={{ duration: 150, delay: 0 }} out:fade={{ duration: 150 }}>
				{#if msg.u === 'system'}
					<em class="message-system">{msg.t}</em>
				{:else}
					<strong class="message-user">{msg.u}:</strong> <span class="message-text">{msg.t}</span>
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
