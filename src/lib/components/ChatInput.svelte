<script lang="ts">
	let { onsend = (t: string) => {}, placeholder = 'Type a message…', receiver = '' } = $props();
	let text = $state('');
	let inputEl: HTMLInputElement | null = null;
	$effect(() => {
		queueMicrotask(() => inputEl?.focus());
	});
	async function suggest() {
		try {
			const res = await fetch('/api/chat/suggest', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ r: receiver })
			});
			if (res.ok) {
				const { s } = await res.json();
				text = s || text;
			}
		} catch {}
	}
	function send() {
		const t = text.trim();
		if (!t) return;
		onsend(t);
		text = '';
	}
</script>

<div class="input-area">
	<input class="message-input" bind:this={inputEl} bind:value={text} onkeydown={(e) => e.key === 'Enter' && send()} {placeholder} />
	<button class="send-button" title="AI suggest" onclick={suggest}>
		<i class="fas fa-magic"></i>
	</button>
	<button class="send-button" onclick={send}>Send</button>
</div>

