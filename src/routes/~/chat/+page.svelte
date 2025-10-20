<script lang="ts">
	import UI from '$lib/components/chat/UI.svelte';
	import type { ChatMessage } from '$lib/types';

	let messages = $state<ChatMessage[]>([]);
	let messageId = $state(0);

	function onsend(data: File | string) {
		if (typeof data === 'string') {
			const userMessage: ChatMessage = {
				i: (++messageId).toString(),
				m: data,
				u: 'user',
				x: 'You'
			};
			messages = [...messages, userMessage];

			// Send to server
			fetch('/chat', {
				method: 'POST',
				body: new URLSearchParams({ message: data }),
				headers: {
					'Content-Type':
						'application/x-www-form-urlencoded'
				}
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.response) {
						const botMessage: ChatMessage = {
							i: (++messageId).toString(),
							m: data.response,
							u: 'bot',
							x: 'Bot'
						};
						messages = [...messages, botMessage];
					} else if (data.error) {
						console.error('Error:', data.error);
					}
				})
				.catch((error) => {
					console.error('Fetch error:', error);
				});
		} else {
			// Handle file - not supported in simple chatbot
			console.log('File upload not supported');
		}
	}
</script>

<UI
	{messages}
	title="Chatbot"
	showIcons={false}
	_=""
	i="chat"
	{onsend}
/>
