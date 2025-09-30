<script lang="ts">
	import { page } from '$app/state';
	import type {
		SendChatMessage,
		ChatMessage,
		Room
	} from '$lib/types';
	import axios from 'axios';
	import RoomNameModal from './RoomNameModal.svelte';
	import { onMount } from 'svelte';
	import RealtimeKitClient from '@cloudflare/realtimekit';
	import { new_id } from '$lib/util/new_id';
	import UI from './chat/UI.svelte';

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
	let show_room_name_modal = $state(false);

	let meeting: RealtimeKitClient | undefined =
		$state(undefined);

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

<UI
	messages={chat_messages}
	title={t}
	{showIcons}
	{r}
	{n}
	{a}
	{_}
	{i}
	{onsend}
	onShowRoomInfo={() => (show_room_name_modal = true)}
	onOpenLive={() => {}}
/>

{#if show_room_name_modal && meeting}
	<RoomNameModal
		full_room_name={t}
		{meeting}
		{i}
		onClose={() => (show_room_name_modal = false)}
	/>
{/if}
