<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import axios from 'axios';

	export let data;

	let messages: Array<{
		id: string;
		text: string;
		sender: string;
		timestamp: Date;
		isOwn: boolean;
	}> = [];

	let newMessage = '';
	let chatContainer: HTMLElement;
	let isConnected = false;
	let isLoading = false;

	$: userId = $page.params.id;

	onMount(() => {
		// Initialize chat connection
		connectToChat();

		// Mock messages for demo
		messages = [
			{
				id: '1',
				text: 'Hey! Nice to meet you!',
				sender: data.otherUser?.tag || 'User',
				timestamp: new Date(Date.now() - 300000),
				isOwn: false
			},
			{
				id: '2',
				text: 'Hi there! Great to connect with you too!',
				sender: data.user?.tag || 'You',
				timestamp: new Date(Date.now() - 240000),
				isOwn: true
			}
		];
	});

	async function connectToChat() {
		isLoading = true;
		try {
			// Placeholder for WebSocket connection
			// In a real implementation, this would establish a WebSocket connection
			await new Promise(resolve => setTimeout(resolve, 1000));
			isConnected = true;
		} catch (error) {
			console.error('Failed to connect to chat:', error);
		} finally {
			isLoading = false;
		}
	}

	async function sendMessage() {
		if (!newMessage.trim() || !isConnected) return;

		const message = {
			id: Date.now().toString(),
			text: newMessage.trim(),
			sender: data.user?.tag || 'You',
			timestamp: new Date(),
			isOwn: true
		};

		messages = [...messages, message];
		newMessage = '';

		// Scroll to bottom
		setTimeout(() => {
			if (chatContainer) {
				chatContainer.scrollTop = chatContainer.scrollHeight;
			}
		}, 100);

		// Placeholder for sending message to server
		try {
			await axios.post(`/api/chat/${userId}`, {
				message: message.text
			});
		} catch (error) {
			console.error('Failed to send message:', error);
		}
	}

	function handleKeyPress(event: KeyboardEvent) {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			sendMessage();
		}
	}

	function formatTime(timestamp: Date): string {
		return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	}
</script>

<svelte:head>
	<title>Chat with {data.otherUser?.tag || 'User'}</title>
</svelte:head>

<div class="chat-container">
	<header class="chat-header">
		<div class="header-content">
			<a href="/user/{userId}" class="back-btn">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
				</svg>
			</a>
			<div class="user-info">
				<h1>{data.otherUser?.tag || 'User'}</h1>
				<span class="status {isConnected ? 'online' : 'offline'}">
					{isConnected ? 'Online' : 'Connecting...'}
				</span>
			</div>
		</div>
	</header>

	<div class="chat-messages" bind:this={chatContainer}>
		{#if isLoading}
			<div class="loading">
				<div class="spinner"></div>
				<p>Connecting to chat...</p>
			</div>
		{:else}
			{#each messages as message (message.id)}
				<div class="message {message.isOwn ? 'own' : 'other'}">
					<div class="message-content">
						<p>{message.text}</p>
						<span class="message-time">{formatTime(message.timestamp)}</span>
					</div>
				</div>
			{/each}
		{/if}
	</div>

	<div class="chat-input">
		<div class="input-container">
			<textarea
				bind:value={newMessage}
				on:keypress={handleKeyPress}
				placeholder="Type your message..."
				rows="1"
				disabled={!isConnected}
			></textarea>
			<button
				class="send-btn"
				on:click={sendMessage}
				disabled={!newMessage.trim() || !isConnected}
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
					<path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
				</svg>
			</button>
		</div>
	</div>
</div>

<style>
	.chat-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #f8fafc;
	}

	.chat-header {
		background: white;
		border-bottom: 1px solid #e2e8f0;
		padding: 1rem 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: 1rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: #f3f4f6;
		color: #374151;
		text-decoration: none;
		border-radius: 50%;
		transition: all 0.2s;
	}

	.back-btn:hover {
		background: #e5e7eb;
		transform: translateX(-2px);
	}

	.user-info h1 {
		font-size: 1.5rem;
		font-weight: 600;
		color: #1f2937;
		margin: 0;
	}

	.status {
		font-size: 0.875rem;
		font-weight: 500;
	}

	.status.online {
		color: #16a34a;
	}

	.status.offline {
		color: #6b7280;
	}

	.chat-messages {
		flex: 1;
		overflow-y: auto;
		padding: 1rem;
		max-width: 800px;
		margin: 0 auto;
		width: 100%;
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: #6b7280;
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 4px solid #e5e7eb;
		border-top: 4px solid #2563eb;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin-bottom: 1rem;
	}

	.message {
		margin-bottom: 1rem;
		display: flex;
	}

	.message.own {
		justify-content: flex-end;
	}

	.message.other {
		justify-content: flex-start;
	}

	.message-content {
		max-width: 70%;
		padding: 0.75rem 1rem;
		border-radius: 18px;
		position: relative;
	}

	.message.own .message-content {
		background: #2563eb;
		color: white;
		border-bottom-right-radius: 6px;
	}

	.message.other .message-content {
		background: white;
		color: #1f2937;
		border: 1px solid #e2e8f0;
		border-bottom-left-radius: 6px;
	}

	.message-content p {
		margin: 0;
		line-height: 1.4;
		word-wrap: break-word;
	}

	.message-time {
		font-size: 0.75rem;
		opacity: 0.7;
		margin-top: 0.25rem;
		display: block;
	}

	.chat-input {
		background: white;
		border-top: 1px solid #e2e8f0;
		padding: 1rem 2rem;
	}

	.input-container {
		display: flex;
		gap: 1rem;
		align-items: flex-end;
		max-width: 800px;
		margin: 0 auto;
	}

	.input-container textarea {
		flex: 1;
		padding: 0.75rem 1rem;
		border: 2px solid #e2e8f0;
		border-radius: 20px;
		font-size: 1rem;
		resize: none;
		min-height: 44px;
		max-height: 120px;
		font-family: inherit;
		transition: border-color 0.2s;
	}

	.input-container textarea:focus {
		outline: none;
		border-color: #2563eb;
	}

	.input-container textarea:disabled {
		background: #f9fafb;
		color: #6b7280;
		cursor: not-allowed;
	}

	.send-btn {
		width: 44px;
		height: 44px;
		background: #2563eb;
		color: white;
		border: none;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		transition: all 0.2s;
		flex-shrink: 0;
	}

	.send-btn:hover:not(:disabled) {
		background: #1d4ed8;
		transform: scale(1.05);
	}

	.send-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}

	@media (max-width: 640px) {
		.chat-header {
			padding: 1rem;
		}

		.chat-messages {
			padding: 0.5rem;
		}

		.chat-input {
			padding: 1rem;
		}

		.message-content {
			max-width: 85%;
		}
	}
</style>
