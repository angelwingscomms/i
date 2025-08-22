<script lang="ts">
	import axios from 'axios';

	let { onsend = (t: string) => {}, placeholder = 'Type a message…', receiver = '' } = $props();
	let text = $state('');
	let inputEl: HTMLInputElement | null = null;
	let isRecording = $state(false);
	let isTranscribing = $state(false);
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];

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

	async function startRecording() {
		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			mediaRecorder = new MediaRecorder(stream);
			audioChunks = [];

			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};

			mediaRecorder.onstop = async () => {
				const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
				await transcribeAudio(audioBlob);
				stream.getTracks().forEach((track) => track.stop());
			};

			mediaRecorder.start();
			isRecording = true;
		} catch (error) {
			console.error('Error starting recording:', error);
			// Could show a toast or alert here
		}
	}

	function stopRecording() {
		if (mediaRecorder && isRecording) {
			mediaRecorder.stop();
			isRecording = false;
		}
	}

	async function transcribeAudio(audioBlob: Blob) {
		isTranscribing = true;
		try {
			const formData = new FormData();
			formData.append('audio', audioBlob);

			const response = await axios.post('/api/transcribe', formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});

			if (response.data.text) {
				// Append transcribed text to existing text
				text = text ? text + ' ' + response.data.text : response.data.text;
			}
		} catch (error) {
			console.error('Transcription error:', error);
			// Could show a toast or alert here
		} finally {
			isTranscribing = false;
		}
	}

	function send() {
		const t = text.trim();
		if (!t) return;
		onsend(t);
		text = '';
	}
</script>

<div class="input-area">
	<input class="message-input" bind:this={inputEl} bind:value={text} onkeydown={(e) => e.key === 'Enter' && send()} {placeholder} disabled={isRecording || isTranscribing} />

	<!-- Voice Recording Controls -->
	{#if !isRecording && !isTranscribing}
		<button class="voice-button" title="Start voice recording" onclick={startRecording}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2M19 12C19 16.2 15.8 19.2 12 19.2S5 16.2 5 12H7C7 15.1 9.5 17.6 12 17.6S17 15.1 17 12H19Z"/>
			</svg>
		</button>
	{:else if isRecording}
		<button class="voice-button recording" title="Stop recording" onclick={stopRecording}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
				<path d="M6 6H18V18H6V6Z"/>
			</svg>
		</button>
	{:else}
		<button class="voice-button transcribing" title="Transcribing..." disabled>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" style="animation: spin 1s linear infinite;"/>
			</svg>
		</button>
	{/if}

	<button class="send-button" title="AI suggest" onclick={suggest} disabled={isRecording || isTranscribing}>
		<i class="fas fa-magic"></i>
	</button>
	<button class="send-button" onclick={send} disabled={isRecording || isTranscribing}>Send</button>
</div>

<style>
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	.voice-button {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		color: var(--text-secondary);
		padding: 8px;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 32px;
		height: 32px;
	}

	.voice-button:hover:not(:disabled) {
		background: var(--color-theme-1);
		border-color: var(--color-theme-1);
		color: white;
	}

	.voice-button.recording {
		background: #dc2626;
		border-color: #dc2626;
		color: white;
		animation: pulse 1.5s infinite;
	}

	.voice-button.transcribing {
		background: var(--color-theme-2);
		border-color: var(--color-theme-2);
		color: white;
	}

	@keyframes pulse {
		0%, 100% { opacity: 1; }
		50% { opacity: 0.6; }
	}

	.voice-button:disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.message-input:disabled {
		background: var(--bg-primary);
		color: var(--text-secondary);
		cursor: not-allowed;
	}

	.send-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>

