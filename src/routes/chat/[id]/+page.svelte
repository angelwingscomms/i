<script lang="ts">
	import { page } from '$app/stores';
	import { onMount, onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { toast_success, toast_error } from '$lib/toast'; // Assuming these exist for notifications
	import type { ChatMessage } from '$lib/types'; // Import the new type

	let messages: ChatMessage[] = [];
	let messageText = '';
	let socket: WebSocket | undefined;
	// Simple random user ID. In a real app, this would come from user authentication (e.g., locals.user.u)
	// For this example, we'll use a random one, but the +server.js uses the authenticated user's ID.
	let userId = 'user_' + Math.random().toString(16).slice(2);

	const chatId = $page.params.id;

	// Function to fetch chat history (will be called onMount)
	async function fetchChatHistory() {
		try {
			// In a real SvelteKit app, you'd use a `+page.server.ts` load function
			// or a +server.ts API endpoint to fetch history.
			// For this example, we'll simulate it by calling a server endpoint.
			// However, since `get_chat_history` is a server-side DB function,
			// we need a +server.js endpoint to expose it.
			const response = await fetch(`/api/chat-history/${chatId}`);
			if (!response.ok) {
				throw new Error('Failed to fetch chat history');
			}
			const history: ChatMessage[] = await response.json();
			messages = history;
			toast_success('Chat history loaded.');
		} catch (error) {
			console.error('Error fetching chat history:', error);
			toast_error('Failed to load chat history.');
		}
	}

	onMount(() => {
		// Fetch chat history when the component mounts
		fetchChatHistory();

		// Determine the WebSocket protocol
		const wsProtocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
		// The +server.js will get the userId from locals.user, so passing it here might be redundant
		// but useful for local testing or if authentication is not fully set up yet.
		const wsUrl = `${wsProtocol}//${location.host}/api/chat/${chatId}`;

		// Create WebSocket connection.
		socket = new WebSocket(wsUrl);

		// Connection opened
		socket.addEventListener('open', (event) => {
			console.log('WebSocket connection opened.');
			messages = [
				...messages,
				{ u: 'system', t: 'Connected to chat!', ts: new Date().toISOString(), r: chatId, s: 'm' }
			];
			toast_success('Connected to chat!');
		});

		// Listen for messages
		socket.addEventListener('message', (event) => {
			try {
				const message: ChatMessage = JSON.parse(event.data);
				messages = [...messages, message];
			} catch (e) {
				console.error('Error parsing message data', e);
				toast_error('Error receiving message.');
			}
		});

		// Connection closed
		socket.addEventListener('close', (event) => {
			console.log('WebSocket connection closed.', event.code, event.reason);
			messages = [
				...messages,
				{
					u: 'system',
					t: 'Connection lost. Please refresh.',
					ts: new Date().toISOString(),
					r: chatId,
					s: 'm'
				}
			];
			toast_error('Chat connection lost.');
		});

		// Connection error
		socket.addEventListener('error', (err) => {
			console.error('WebSocket error:', err);
			messages = [
				...messages,
				{
					u: 'system',
					t: 'WebSocket error occurred.',
					ts: new Date().toISOString(),
					r: chatId,
					s: 'm'
				}
			];
			toast_error('WebSocket error.');
		});

		return () => {
			if (socket) {
				socket.close();
				socket = undefined; // Clear the socket reference
			}
		};
	});

	function sendMessage() {
		if (messageText && socket && socket.readyState === WebSocket.OPEN) {
			socket.send(messageText);
			messageText = '';
		} else if (socket && socket.readyState !== WebSocket.OPEN) {
			toast_error('Cannot send message: WebSocket is not open.');
		}
	}
</script>

<div class="chat-layout">
	<h1 class="chat-title">Chat Room: {chatId}</h1>
	<div class="messages-container">
		{#each messages as msg (msg.ts + msg.u)}
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
			bind:value={messageText}
			on:keydown={(e) => e.key === 'Enter' && sendMessage()}
			placeholder="Type a message..."
		/>
		<button class="send-button" on:click={sendMessage}>Send</button>
	</div>
</div>
