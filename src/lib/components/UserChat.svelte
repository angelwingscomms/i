<script lang="ts">
	import ChatBox from './ChatBox.svelte';
	import type { ChatMessage } from '$lib/types';
	let { messages = [] as ChatMessage[], onsend = (t: string) => {} } = $props();
</script>

<ChatBox {messages} {onsend} />

