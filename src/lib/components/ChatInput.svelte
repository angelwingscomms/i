<script lang="ts">
	import axios from 'axios';

	let { onsend = (t: string, files?: string[]) => {}, placeholder = 'Type a message…', receiver = '' } = $props();
	let text = $state('');
	let inputEl: HTMLInputElement | null = null;
	let isRecording = $state(false);
	let isTranscribing = $state(false);
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let selectedFiles = $state<File[]>([]);
	let isUploading = $state(false);
	let fileInputEl: HTMLInputElement | null = null;

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

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = Array.from(target.files || []);

		// Filter out files that are too large (e.g., 50MB limit)
		const maxSize = 50 * 1024 * 1024; // 50MB
		const validFiles = files.filter(file => {
			if (file.size > maxSize) {
				console.warn(`File ${file.name} is too large (${(file.size / 1024 / 1024).toFixed(1)}MB)`);
				return false;
			}
			return true;
		});

		selectedFiles = [...selectedFiles, ...validFiles];

		// Reset file input
		if (fileInputEl) {
			fileInputEl.value = '';
		}
	}

	async function uploadFiles(): Promise<string[]> {
		if (selectedFiles.length === 0) return [];

		isUploading = true;
		try {
			const formData = new FormData();
			selectedFiles.forEach(file => {
				formData.append('files', file);
			});

			const response = await axios.post('/i/upload', formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			});

			return response.data.x || [];
		} catch (error) {
			console.error('File upload error:', error);
			return [];
		} finally {
			isUploading = false;
		}
	}

	function removeFile(index: number) {
		selectedFiles = selectedFiles.filter((_, i) => i !== index);
	}

	function send() {
		const t = text.trim();
		if (!t && selectedFiles.length === 0) return;

		// Send immediately if no files to upload
		if (selectedFiles.length === 0) {
			onsend(t);
			text = '';
			return;
		}

		// Upload files first, then send message
		uploadFiles().then(fileUrls => {
			onsend(t, fileUrls);
			text = '';
			selectedFiles = [];
		}).catch(error => {
			console.error('Error sending message with files:', error);
		});
	}
</script>

<div class="input-area">
	<!-- File Preview Area -->
	{#if selectedFiles.length > 0}
		<div class="file-preview">
			{#each selectedFiles as file, index}
				<div class="file-item">
					<span class="file-name">{file.name}</span>
					<span class="file-size">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
					<button class="remove-file" onclick={() => removeFile(index)} title="Remove file">
						<i class="fas fa-times"></i>
					</button>
				</div>
			{/each}
		</div>
	{/if}

	<input class="message-input" bind:this={inputEl} bind:value={text} onkeydown={(e) => e.key === 'Enter' && send()} {placeholder} disabled={isRecording || isTranscribing || isUploading} />

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

	<!-- File Upload Button -->
	<input
		type="file"
		bind:this={fileInputEl}
		onchange={handleFileSelect}
		multiple
		accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt,.csv,.zip"
		style="display: none;"
	/>
	<button
		class="file-button"
		title="Attach files"
		onclick={() => fileInputEl?.click()}
		disabled={isRecording || isTranscribing || isUploading}
	>
		<i class="fas fa-paperclip"></i>
	</button>

	<button class="send-button" title="AI suggest" onclick={suggest} disabled={isRecording || isTranscribing || isUploading}>
		<i class="fas fa-magic"></i>
	</button>
	<button class="send-button" onclick={send} disabled={isRecording || isTranscribing || isUploading}>
		{#if isUploading}
			<i class="fas fa-spinner fa-spin"></i>
		{:else}
			Send
		{/if}
	</button>
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

	.file-preview {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.75rem;
		background: var(--bg-secondary, #f8f9fa);
		border: 1px solid var(--border-color, #e9ecef);
		border-radius: 8px;
		margin-bottom: 0.5rem;
		max-height: 200px;
		overflow-y: auto;
	}

	.file-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.375rem 0.5rem;
		background: white;
		border: 1px solid var(--border-color, #dee2e6);
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.file-name {
		flex: 1;
		font-weight: 500;
		color: var(--text-primary, #212529);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.file-size {
		color: var(--text-secondary, #6c757d);
		font-size: 0.75rem;
		white-space: nowrap;
	}

	.remove-file {
		background: none;
		border: none;
		color: var(--text-secondary, #6c757d);
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 2px;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
	}

	.remove-file:hover {
		background: #f8d7da;
		color: #dc3545;
	}

	.file-button {
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
		font-size: 0.875rem;
	}

	.file-button:hover:not(:disabled) {
		background: var(--color-theme-1);
		border-color: var(--color-theme-1);
		color: white;
	}

	.file-button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>

