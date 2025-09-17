<script lang="ts">
	import type { ChatMessage } from '$lib/types';
	let {
		messages = [] as ChatMessage[],
		onsend = (t: string) => {}
	} = $props();
	let text = $state('');
	function send() {
		const t = text.trim();
		if (!t) return;
		onsend(t);
		text = '';
	}
</script>

<div class="chat-layout">
	<div class="messages-container">
		{#each messages as msg (msg.i)}
			<div class="chat_item">
				<div
					class="chat_bubble {msg.saved
						? ''
						: 'chat_bubble--pending'}"
				>
					<span class="message-text">{msg.m}</span>
				</div>
			</div>
		{/each}
	</div>
	<div class="input-area">
		<input
			class="message-input"
			bind:value={text}
			onkeydown={(e) => e.key === 'Enter' && send()}
		/>
		<button class="send-button" onclick={send}
			>Send</button
		>
	</div>
</div>
