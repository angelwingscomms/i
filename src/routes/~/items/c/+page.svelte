<script lang="ts">
	import axios from 'axios';
	import ChatBox from '$lib/components/ChatBox.svelte';
	import type { PageProps } from './$types';
	import type { ChatMessage } from '$lib/types';
	let { data }: PageProps = $props();
	let messages = $state(
		(data as any).m as ChatMessage[]
	);

	async function onsend(text: string) {
		const d = Date.now();
		const tempId = crypto.randomUUID();
		messages = [
			...messages,
			{ m: text, i: tempId } as ChatMessage
		];
		try {
			await axios.post('/~/i', {
				m: text,
				d,
				i: tempId
			});
		} catch {
			// leave pending in UI; server will correct via websocket if any
		}
	}
</script>

<div class="chat-layout">
	<ChatBox {messages} {onsend} />
</div>
