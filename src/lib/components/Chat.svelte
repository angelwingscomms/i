<script lang="ts">
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import type {
		SendChatMessage,
		ChatMessage,
		Room
	} from '$lib/types';
	import axios from 'axios';
	import { animate, stagger } from 'animejs';
	import FileWidget from './FileWidget.svelte';
	import ChatInput from './ChatInput.svelte';
	import RoomNameModal from './RoomNameModal.svelte';
	import { onMount } from 'svelte';
	import RealtimeKitClient from '@cloudflare/realtimekit';
	import { ROOM_NAME_DISPLAY_LIMIT } from '$lib/constants';
	import { new_id } from '$lib/util/new_id';

	let {
		m,
		t,
		_,
		r,
		n,
		a,
		authToken,
		showIcons = true,
		i
	}: {
		showIcons?: boolean;
		authToken: string;
		n?: number;
		a?: number;
		r?: number | undefined;
		m: ChatMessage[];
		t: string;
		_: Room['_'];
		i: string; //room id
	} = $props();

	let chat_messages: ChatMessage[] = $state(m);
	let message_text = $state('');
	let messagesEl: HTMLElement | null = null;
	let liveOpen = $state(true);
	let show_room_name_modal = $state(false);

	let meeting: RealtimeKitClient | undefined =
		$state(undefined);
	let display_room_name = $state('');

	$effect(() => {
		if (t.length > ROOM_NAME_DISPLAY_LIMIT) {
			display_room_name =
				t.slice(0, ROOM_NAME_DISPLAY_LIMIT) + '...';
		} else {
			display_room_name = t;
		}
	});

	$effect(() => {
		if (messagesEl) {
			animate_in_list(messagesEl);
			const stop = observe_list(messagesEl);
			messagesEl.scrollTop = messagesEl.scrollHeight;
			return () => stop();
		}
	});

	const onsend = (
		data: File | string,
		files?: string[]
	) => {
		if (data instanceof File) {
			meeting?.chat.sendFileMessage(data);
			const formData = new FormData();
			formData.append('files', data);
			formData.append('m', '');
			formData.append('i', new_id());
			formData.append('_', _);
			save_message_with_formdata(formData);
		} else {
			meeting?.chat.sendTextMessage(data);
			save_message(data);
		}
	};

	function animate_in_list(container: HTMLElement) {
		const items = Array.from(
			container.querySelectorAll('.chat_item')
		).filter(
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
		items.forEach((el) =>
			el.setAttribute('data-animated', '1')
		);
		container.scrollTop = container.scrollHeight;
	}

	function observe_list(container: HTMLElement) {
		const mo = new MutationObserver(() =>
			animate_in_list(container)
		);
		mo.observe(container, {
			childList: true,
			subtree: true
		});
		return () => mo.disconnect();
	}

	onMount(async () => {
		meeting = await RealtimeKitClient.init({
			authToken,
			defaults: {
				audio: false,
				video: false
			}
		});

		meeting.joinRoom();

		meeting.chat.on('chatUpdate', ({ message }) => {
			console.log(
				`Received message ${JSON.stringify(message, null, 2)}`
			);
			chat_messages = [
				...chat_messages,
				{
					i: message.id,
					m: message.message,
					x: message.displayName,
					u: message.userId,
					...(message.link
						? { f: [message.link] }
						: {})
				}
			];
		});
	});

	function save_message_with_formdata(
		formData: FormData
	) {
		const messageText = formData.get('m') as string;
		const messageId = formData.get('i') as string;

		const files = formData
			.getAll('files')
			.filter((f) => f instanceof File) as File[];

		if (messageText || files.length > 0) {
			console.log(
				'Sending message with FormData to:',
				page.url.pathname
			);

			axios
				.post(page.url.pathname, formData, {
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				})
				.catch((error) => {
					console.error(
						'Error sending message:',
						error
					);
					chat_messages = chat_messages.filter(
						(msg) => msg.i !== messageId
					);
				});
		}
	}

	function save_message(
		text?: string,
		fileUrls?: string[]
	) {
		const messageText = text || message_text;
		const files = fileUrls || [];

		let m: SendChatMessage = {
			m: messageText,
			t,
			_,
			d: Date.now(),
			i: new_id(),
			...(_ === '-' ? { a: '1' } : {}),
			...(files.length > 0 && { f: files })
		};

		if (messageText || files.length > 0) {
			axios.post(`/r/${i}`, m);
		}
	}
</script>

<div class="chat-layout">
	<div class="chat-header chat-header-layout">
		{#if r}
			<div
				class="chat-title-group flex items-center gap-2"
			>
				<h1
					class="chat-title flex-shrink-min text-sm font-light text-fuchsia-400"
				>
					replies to <span class="text-white"
						>{display_room_name}</span
					>
				</h1>
				{#if showIcons}
					<button
						class="ml-2 rounded p-0 align-middle text-gray-400 hover:text-white focus:outline-none"
						onclick={() =>
							(show_room_name_modal = true)}
						aria-label="Show room information"
						><i class="fas fa-info-circle"
						></i></button
					>
					<a
						href="{page.url}/live"
						class="ml-2 rounded p-0 align-middle text-gray-400 hover:text-white focus:outline-none"
						aria-haspopup="dialog"
						aria-controls="live-modal"
						onclick={() => (liveOpen = true)}
						aria-label="Open video chat"
						><i class="fas fa-video"></i></a
					>
				{/if}
			</div>
		{:else if _ === '-'}
			{#if a}
				<div
					class="chat-title-group flex items-center gap-2"
				>
					<h1
						class="chat-title flex-shrink-min text-sm font-light text-gray-500"
					>
						anon chat {n} with {display_room_name}
					</h1>
					<button
						class="ml-2 rounded p-0 align-middle text-gray-400 hover:text-white focus:outline-none"
						onclick={() =>
							(show_room_name_modal = true)}
						><i class="fas fa-info-circle"
						></i></button
					>
					<a
						href="{page.url}/live"
						class="ml-2 rounded p-0 align-middle text-gray-400 hover:text-white focus:outline-none"
						aria-haspopup="dialog"
						aria-controls="live-modal"
						onclick={() => (liveOpen = true)}
						><i class="fas fa-video"></i></a
					>
				</div>
			{:else}
				<div
					class="chat-title-group flex items-center gap-2"
				>
					<h1
						class="chat-title text-sm font-light text-gray-500"
					>
						anonymous user
					</h1>
					{#if showIcons}
						<a
							href="{page.url}/live"
							class="ml-2 rounded p-0 align-middle text-gray-400 hover:text-white focus:outline-none"
							aria-haspopup="dialog"
							aria-controls="live-modal"
							onclick={() => (liveOpen = true)}
							><i class="fas fa-video"></i></a
						>
					{/if}
				</div>
			{/if}
		{:else}
			<div
				class="chat-title-group flex items-center gap-2"
			>
				<h1
					class="chat-title flex-shrink-min text-sm"
				>
					{display_room_name}
				</h1>
				{#if showIcons}
					<button
						class="ml-2 rounded p-0 align-middle text-gray-400 hover:text-white focus:outline-none"
						onclick={() =>
							(show_room_name_modal = true)}
						aria-label="Show room information"
						><i class="fas fa-info-circle"
						></i></button
					>
					<a
						href="{page.url}/live"
						class="ml-2 rounded p-0 align-middle text-gray-400 hover:text-white focus:outline-none"
						aria-haspopup="dialog"
						aria-controls="live-modal"
						onclick={() => (liveOpen = true)}
						aria-label="Open video chat"
						><i class="fas fa-video"></i></a
					>
				{/if}
			</div>
		{/if}
	</div>
	<div
		class="messages-container"
		bind:this={messagesEl}
	>
		{#if meeting?.chat.messages}
			{#each chat_messages as msg, i (msg.i)}
				<a
					class="chat_item flex w-full flex-col {msg.u ===
					page.data.user?.i
						? 'items-end'
						: 'items-start'} mb-2 items-end gap-1"
					in:fade={{ duration: 150, delay: 0 }}
					out:fade={{ duration: 150 }}
					href={page.url.pathname
						.split('/')
						.slice(0, -1)
						.join('/') +
						'/' +
						msg.i}
					data-msg-id={msg.i}
				>
					<div class="chat_meta w-full">
						{#if msg.x && msg.x !== page.data.user?.t && chat_messages[i - 1]?.x !== msg.x && _ !== '|' && _ !== '-'}
							<div
								class="chat_username w-full text-left break-words"
							>
								{msg.x}
							</div>
						{/if}
					</div>
					<div
						class={`chat_bubble ${msg.x === page.data.user?.t ? 'chat_bubble--self' : ''} ${msg.x ? '' : 'chat_bubble--anon'} ${msg.saved ? '' : 'chat_bubble--pending'} ${msg.u === page.data.user?.i ? 'self-end' : 'self-start'} max-w-[80%]`}
					>
						<div
							class="message-text overflow-wrap-anywhere break-words whitespace-pre-wrap"
						>
							{msg.m}
						</div>
						{#if msg.f && msg.f.length > 0}
							<div class="mt-2 flex flex-col gap-1.5">
								<FileWidget url={msg.f[0]} />
							</div>
						{/if}
					</div>
				</a>
			{/each}
		{/if}
	</div>
	<div class="input-area">
		<ChatInput
			{onsend}
			placeholder="Type a message..."
			{t}
		/>
	</div>

	{#if show_room_name_modal && meeting}
		<RoomNameModal
			full_room_name={t}
			{meeting}
			{i}
			onClose={() => (show_room_name_modal = false)}
		/>
	{/if}
</div>
