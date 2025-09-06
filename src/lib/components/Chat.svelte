<script lang="ts">
	import { page } from '$app/state';
	import { v7 } from 'uuid';
	import { fade } from 'svelte/transition';
	import type { SendChatMessage, ChatMessage, Room } from '$lib/types'; // Import the new type
	import axios from 'axios';
	import { animate, stagger } from 'animejs';
	import FileWidget from './FileWidget.svelte';
	import ChatInput from './ChatInput.svelte';
	import LiveModal from './LiveModal.svelte';
	let {
		m,
		t,
		_,
		r,
		n,
		a,
		authToken
	}: {
		authToken: string;
		n?: number;
		a?: number;
		r?: number | undefined;
		m: ChatMessage[];
		s: string;
		t: string;
		_: Room['_'];
	} = $props();
	const roomId: string = page.url.pathname.split('/')[2] || '';

	let chat_messages: ChatMessage[] = $state(m);
	let message_text = $state('');
	let messages = $state(
		m.map((chat_msg) => ({
			id: chat_msg.i,
			message: chat_msg.m,
			displayName: chat_msg.x,
			userId: chat_msg.u,
			m: chat_msg.m,
			link: chat_msg.f && chat_msg.f.length > 0 ? chat_msg.f[0] : undefined,
			f: chat_msg.f,
			saved: true
		}))
	);
	let messagesEl: HTMLElement | null = null;
	let liveOpen = $state(true);
	console.log('mm', m);

	let meeting: RealtimeKitClient | undefined = $state(undefined);

	import { onMount } from 'svelte';
	import RealtimeKitClient from '@cloudflare/realtimekit';

	// Define onsend function for ChatInput
	const onsend = (data: File | string, files?: string[]) => {
		if (data instanceof File) {
			meeting?.chat.sendFileMessage(data);
			const formData = new FormData();
			formData.append('files', data);
			formData.append('m', ''); // Generate a message ID
			formData.append('i', v7()); // Generate a message ID
			save_message_with_formdata(formData);
		} else {
			meeting?.chat.sendTextMessage(data);
			save_message(data);
		}
	};

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

	// $effect(() => {
	// 	console.log('c', c);
	// 	websocket = new WebSocket('ws' + PUBLIC_WORKER + '/' + c + s);

	// 	websocket.onopen = () => {
	// 		console.log('WebSocket connection opened.');
	// 	};

	// 	// Listen for messages
	// 	websocket.onmessage = (event) => {
	// 		console.log('event', event);
	// 		try {
	// 			const message: ChatMessage = JSON.parse(event.data);
	// 			let sent_message = chat_messages.find((m) => m.i === message.i);
	// 			if (sent_message) {
	// 				sent_message.saved = true;
	// 			} else {
	// 				chat_messages = [...chat_messages, { ...message, saved: true }];
	// 			}
	// 		} catch (e) {
	// 			console.error('Error parsing message data', e);
	// 			toast.error('Error receiving message.');
	// 		}
	// 	};

	// 	// Connection closed
	// 	websocket.addEventListener('close', (event) => {
	// 		console.log('WebSocket connection closed.', event.code, event.reason);
	// 		toast.error('Chat connection lost.');
	// 	});

	// 	// Connection error
	// 	websocket.addEventListener('error', (err) => {
	// 		console.error('WebSocket error:', err);
	// 		toast.error('WebSocket error.');
	// 	});

	// 	return () => {
	// 		if (websocket) {
	// 			websocket.close();
	// 			websocket = undefined; // Clear the socket reference
	// 		}
	// 	};
	// });

	$effect(() => {
		if (messagesEl) {
			animate_in_list(messagesEl);
			const stop = observe_list(messagesEl);
			// initial scroll to bottom to show latest messages fully
			messagesEl.scrollTop = messagesEl.scrollHeight;
			return () => stop();
		}
		// ChatInput handles its own focus
	});

	$effect(() => {
		JSON.stringify(meeting?.chat.messages);
		console.log('msgs', meeting?.chat.messages);
	});

	onMount(async () => {
		meeting = await RealtimeKitClient.init({
			authToken,
			defaults: {
				audio: false,
				video: false
			}
		});

		console.log('am', $state.snapshot(messages));
		meeting.joinRoom();

		meeting.chat.on('chatUpdate', ({ message }) => {
			console.log(`Received message ${message}`);
			messages = [...messages, message];
		});
	});

	function save_message_with_formdata(formData: FormData) {
		// Extract data from FormData for optimistic UI update
		const messageText = formData.get('m') as string;
		const messageId = formData.get('i') as string;

		// Get files from FormData for optimistic UI
		const files = formData.getAll('files').filter((f) => f instanceof File) as File[];

		if (messageText || files.length > 0) {
			// Add message to UI immediately for optimistic update
			// chat_messages.push({
			// 	m: messageText,
			// 	i: messageId,
			// 	x: page.data.user.t,
			// 	saved: false
			// 	// Note: We can't show file URLs until server processes them
			// 	// Files will be updated via websocket when server responds
			// });

			// message_text = '';
			console.log('Sending message with FormData to:', page.url.pathname);

			// Send FormData to message route
			axios
				.post(page.url.pathname, formData, {
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				})
				.catch((error) => {
					console.error('Error sending message:', error);
					// Remove optimistic message on error
					chat_messages = chat_messages.filter((msg) => msg.i !== messageId);
				});
		}
	}

	function save_message(text?: string, fileUrls?: string[]) {
		const messageText = text || message_text;
		const files = fileUrls || [];

		let m: SendChatMessage = {
			m: messageText,
			t,
			d: Date.now(),
			i: v7(),
			...(_ === '-' ? { a: '1' } : {}),
			...(files.length > 0 && { f: files })
		};

		if (messageText || files.length > 0) {
			chat_messages.push({
				m: m.m,
				i: m.i,
				x: page.data.user.t,
				saved: false,
				...(files.length > 0 && { f: files })
			});
			message_text = '';
			console.log(page.url.pathname);
			axios.post(page.url.pathname, m);
		}
	}

	$inspect(messages);
</script>

<div class="chat-layout">
	<div class="chat-header">
		{#if r}
			<h1 class="chat-title font-light text-fuchsia-400 italic">replies to <span class="text-white">{t}</span></h1>
		{:else if _ === '-'}
			{#if a}
				<h1 class="chat-title font-light text-gray-500 italic">anon chat {n} with {t}</h1>
			{:else}
				<h1 class="chat-title font-light text-gray-500 italic">anonymous user</h1>
			{/if}
		{:else}
			<h1 class="chat-title">{t}</h1>
		{/if}
		<div class="row gap">
			<a
				href="{page.url}/live"
				class="btn"
				aria-haspopup="dialog"
				aria-controls="live-modal"
				onclick={() => (liveOpen = true)}>LIVE</a
			>
		</div>
	</div>
	<div class="messages-container" bind:this={messagesEl}>
		{#if meeting?.chat.messages}
			{#each messages as msg, i (msg.id)}
				{#if _}
					<a
						class="chat_item"
						in:fade={{ duration: 150, delay: 0 }}
						out:fade={{ duration: 150 }}
						href={page.url.pathname.split('/').slice(0, -1).join('/') + '/' + msg.id}
						data-msg-id={msg.id}
						style={`align-items:${msg.userId === page.data.user?.i ? 'flex-end' : 'flex-start'}`}
					>
						<div
							class="chat_meta"
							style={`justify-content:${msg.userId === page.data.user?.t ? 'flex-end' : 'flex-start'}`}
						>
							{#if msg.displayName && msg.displayName !== page.data.user?.t && chat_messages[i - 1]?.displayName !== msg.displayName && _ !== '|' && _ !== '-'}
								<div class="chat_username">{msg.displayName}</div>
							{/if}
						</div>
						<div
							class={`chat_bubble ${msg.displayName === page.data.user?.t ? 'chat_bubble--self' : ''} ${msg.displayName ? '' : 'chat_bubble--anon'} ${msg.saved ? '' : 'chat_bubble--pending'}`}
							style={`max-width: 90%; ${msg.displayName === page.data.user?.t ? 'margin-left:auto;' : 'margin-right:auto;'}`}
						>
							<span class="message-text">{msg.m}</span>
							{#if msg.link}
								<div class="message-files">
									<!-- {#each msg.f as fileUrl} -->
									<FileWidget url={msg.link} />
									<!-- {/each} -->
								</div>
							{/if}
						</div>
					</a>
				{:else}
					<div
						class="chat_item"
						in:fade={{ duration: 150, delay: 0 }}
						out:fade={{ duration: 150 }}
						data-msg-id={msg.i}
						style={`align-items:${msg.displayName === page.data.user?.t ? 'flex-end' : 'flex-start'}`}
					>
						<div
							class="chat_meta"
							style={`justify-content:${msg.displayName === page.data.user?.t ? 'flex-end' : 'flex-start'}`}
						>
							{#if msg.displayName && msg.displayName !== page.data.user?.t && chat_messages[i - 1]?.displayName !== msg.displayName && _ !== '|' && _ !== '-'}
								<div class="chat_username">{msg.displayName}</div>
							{/if}
						</div>
						<div
							class={`chat_bubble ${msg.displayName === page.data.user?.t ? 'chat_bubble--self' : ''} ${msg.displayName ? '' : 'chat_bubble--anon'} ${msg.saved ? '' : 'chat_bubble--pending'}`}
							style={`max-width: 90%; ${msg.displayName === page.data.user?.t ? 'margin-left:auto;' : 'margin-right:auto;'}`}
						>
							<span class="message-text">{msg.message}</span>
							{#if msg.f && msg.f.length > 0}
								<div class="message-files">
									{#each msg.f as fileUrl}
										<FileWidget url={fileUrl} />
									{/each}
								</div>
							{/if}
						</div>
					</div>
				{/if}
			{/each}
		{/if}
	</div>
	<div class="input-area">
		<ChatInput {onsend} placeholder="Type a message..." {t} />
	</div>
</div>

<style>
	.message-files {
		margin-top: 0.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.message-files:empty {
		display: none;
	}
</style>
