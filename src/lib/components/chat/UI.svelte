<script lang="ts">
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import type { ChatMessage, Room } from '$lib/types';
	import { animate, stagger } from 'animejs';
	import FileWidget from '../FileWidget.svelte';
	import DescriptionInput from '../ui/DescriptionInput.svelte';
	import { ROOM_NAME_DISPLAY_LIMIT } from '$lib/constants';

	let {
		messages,
		title,
		showIcons = true,
		r,
		n,
		a,
		_,
		i,
		onsend,
		onShowRoomInfo = () => {},
		onOpenLive = () => {}
	}: {
		showIcons?: boolean;
		r?: number | undefined;
		n?: number;
		a?: number;
		messages: ChatMessage[];
		title: string;
		_: Room['_'];
		i: string; //room id
		onsend: (data: File | string) => void;
		onShowRoomInfo?: () => void;
		onOpenLive?: () => void;
	} = $props();

	let message_text = $state('');
	let selectedFile: File | null = $state(null);
	let fileInputEl: HTMLInputElement | null = null;
	let messagesEl: HTMLElement | null = null;

	let display_room_name = $state('');

	$effect(() => {
		if (title.length > ROOM_NAME_DISPLAY_LIMIT) {
			display_room_name =
				title.slice(0, ROOM_NAME_DISPLAY_LIMIT) +
				'...';
		} else {
			display_room_name = title;
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

	let fileButton = [
		{
			icon_classes: 'fas fa-paperclip',
			send: () => fileInputEl?.click()
		}
	];

	let sendDisabled = $derived(
		!message_text.trim() && !selectedFile
	);

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			const maxSize = 50 * 1024 * 1024; // 50MB
			if (file.size > maxSize) {
				console.warn(
					`File ${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB)`
				);
				return;
			}
			selectedFile = file;
		}
		if (fileInputEl) {
			fileInputEl.value = '';
		}
	}

	function handleSend(value: string) {
		const trimmed = value.trim();
		if (selectedFile) {
			onsend(selectedFile);
		} else if (trimmed) {
			onsend(trimmed);
		}
		message_text = '';
		selectedFile = null;
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
						onclick={onShowRoomInfo}
						aria-label="Show room information"
						><i class="fas fa-info-circle"
						></i></button
					>
					<a
						href="{page.url}/live"
						class="ml-2 rounded p-0 align-middle text-gray-400 hover:text-white focus:outline-none"
						aria-haspopup="dialog"
						aria-controls="live-modal"
						onclick={onOpenLive}
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
						onclick={onShowRoomInfo}
						><i class="fas fa-info-circle"
						></i></button
					>
					<a
						href="{page.url}/live"
						class="ml-2 rounded p-0 align-middle text-gray-400 hover:text-white focus:outline-none"
						aria-haspopup="dialog"
						aria-controls="live-modal"
						onclick={onOpenLive}
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
							onclick={onOpenLive}
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
						onclick={onShowRoomInfo}
						aria-label="Show room information"
						><i class="fas fa-info-circle"
						></i></button
					>
					<a
						href="{page.url}/live"
						class="ml-2 rounded p-0 align-middle text-gray-400 hover:text-white focus:outline-none"
						aria-haspopup="dialog"
						aria-controls="live-modal"
						onclick={onOpenLive}
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
		{#each messages as msg, i (msg.i)}
			<a
				class="chat_item flex w-full flex-col {msg.u ===
				page.data.user?.i
					? 'items-end'
					: 'items-start'} items-end gap-1"
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
					{#if msg.x && msg.x !== page.data.user?.t && messages[i - 1]?.x !== msg.x && _ !== '|' && _ !== '-'}
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
	</div>
	<div class="input-area">
		{#if selectedFile}
			<div
				class="file-preview mb-2 flex max-h-48 flex-col gap-2 overflow-y-auto rounded-lg border border-gray-300 bg-gray-100 p-3"
			>
				<div
					class="file-item flex items-center gap-2 rounded border border-gray-300 bg-white p-2 text-sm"
				>
					<span
						class="file-name flex-1 truncate font-medium text-gray-900"
						>{selectedFile.name}</span
					>
					<span
						class="file-size text-xs text-gray-500"
						>({(
							selectedFile.size /
							1024 /
							1024
						).toFixed(1)}MB)</span
					>
					<button
						class="remove-file flex h-5 w-5 items-center justify-center rounded border-none bg-none p-1 text-gray-500 hover:bg-red-100 hover:text-red-500"
						onclick={() => (selectedFile = null)}
						title="Remove file"
					>
						<i class="fas fa-times"></i>
					</button>
				</div>
			</div>
		{/if}
		<input
			type="file"
			bind:this={fileInputEl}
			onchange={handleFileSelect}
			accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.csv,.zip"
			style="display: none;"
		/>
		<DescriptionInput
			bind:value={message_text}
			placeholder="Type a message..."
			rows={1}
			editable={true}
			voice_typing={true}
			send={handleSend}
			buttons_below={false}
			buttons={fileButton}
			send_loading={sendDisabled}
		/>
	</div>
</div>
