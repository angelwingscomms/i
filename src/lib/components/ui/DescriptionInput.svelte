<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import axios from 'axios';

	export let value = '';
	export let maxLength = 500;
	export let editable = true;
	export let autoUpdate = false;
	export let endpoint = '/api/update-description';
	export let placeholder = `Tell us about yourself, your interests, what you're looking for...`;
	export let rows = 6;

	let originalValue = value;
	let isSaving = false;
	let error = '';
	let success = '';
	let isRecording = false;
	let isTranscribing = false;
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let charCount = value.length;

	const dispatch = createEventDispatcher();

	$: {
		// Update char count when value changes
		charCount = value?.length || 0;
	}
	
	// async function handleBlur() {
	// 	if (autoUpdate && value !== originalValue) {
	// 		await updateDescription();
	// 	}
	// 	dispatch('blur', { value });
	// } TODO-WS

	async function updateDescription() {
		if (!value.trim()) {
			error = 'Description cannot be empty';
			return false;
		}

		if (value === originalValue) {
			return true; // No changes, no need to update
		}

		isSaving = true;
		error = '';
		success = '';

		try {
			const response = await axios.post(endpoint, { description: value });
			if (response.data.success) {
				success = 'Description updated successfully';
				originalValue = value;
				dispatch('update', { value, success: true });
				return true;
			} else {
				error = response.data.error || 'Failed to update description';
				dispatch('update', { value, success: false, error });
				return false;
			}
		} catch (err: any) {
			error = err.response?.data?.error || 'An error occurred while updating';
			dispatch('update', { value, success: false, error });
			return false;
		} finally {
			isSaving = false;

			// Clear success message after 3 seconds
			if (success) {
				setTimeout(() => {
					success = '';
				}, 3000);
			}
		}
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
			alert('Could not access microphone');
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
				value = response.data.text;
				dispatch('input', { value });

				// if (autoUpdate) {
				// 	await updateDescription();
				// }
			}
		} catch (error) {
			console.error('Transcription error:', error);
			alert('Failed to transcribe audio');
		} finally {
			isTranscribing = false;
		}
	}
</script>

<div class="description-container">
	<textarea
		id="description"
		name="description"
		bind:value
		class="form-textarea {!editable ? 'readonly' : ''}"
		placeholder={placeholder}
		rows={rows}
		required
		on:input
		disabled={!editable || isSaving || isTranscribing}
		readonly={!editable}
	></textarea>

	<div class="description-controls">
		<div class="char-count {charCount > maxLength ? 'text-red-500' : ''}">
			{charCount}/{maxLength}
		</div>

		{#if editable}
			<div class="voice-controls">
				{#if !isRecording && !isTranscribing}
					<button type="button" class="voice-btn" on:click={startRecording}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2M19 12C19 16.2 15.8 19.2 12 19.2S5 16.2 5 12H7C7 15.1 9.5 17.6 12 17.6S17 15.1 17 12H19Z"
							/>
						</svg>
						Start Recording
					</button>
				{:else if isRecording}
					<button type="button" class="voice-btn recording" on:click={stopRecording}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M6 6H18V18H6V6Z" />
						</svg>
						Stop Recording
					</button>
				{:else}
					<button type="button" class="voice-btn transcribing" disabled>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"
								style="animation: spin 1s linear infinite;"
							/>
						</svg>
						Transcribing...
					</button>
				{/if}
			</div>

			{#if !autoUpdate}
				<button
					type="button"
					class="update-btn"
					on:click={updateDescription}
					disabled={isSaving || value === originalValue}
				>
					{isSaving ? 'Saving...' : 'Update'}
				</button>
			{/if}
		{/if}
	</div>

	{#if error}
		<div class="error-message">
			{error}
		</div>
	{/if}

	{#if success}
		<div class="success-message">
			{success}
		</div>
	{/if}
</div>

<style>
	.description-container {
		position: relative;
		width: 100%;
	}

	.form-textarea {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #d1d5db;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
		resize: vertical;
		min-height: 120px;
	}

	.form-textarea:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
	}

	.form-textarea.readonly {
		background: #f8fafc;
		cursor: not-allowed;
	}

	.description-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 0.5rem;
	}

	.char-count {
		font-size: 0.8rem;
		color: #6b7280;
	}

	.voice-controls {
		display: flex;
		gap: 0.5rem;
	}

	.voice-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		background: #2563eb;
		color: white;
	}

	.voice-btn:hover:not(:disabled) {
		background: #1d4ed8;
	}

	.voice-btn.recording {
		background: #dc2626;
		animation: pulse 1s infinite;
	}

	.voice-btn.transcribing {
		background: #6b7280;
		cursor: not-allowed;
	}

	.update-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 6px;
		font-size: 0.875rem;
		cursor: pointer;
		transition: all 0.2s;
		background: #16a34a;
		color: white;
	}

	.update-btn:hover:not(:disabled) {
		background: #15803d;
	}

	.update-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.error-message {
		background: #fef2f2;
		color: #dc2626;
		padding: 0.75rem;
		border-radius: 6px;
		border: 1px solid #fecaca;
		margin-top: 0.75rem;
		font-size: 0.9rem;
	}

	.success-message {
		background: #f0fdf4;
		color: #16a34a;
		padding: 0.75rem;
		border-radius: 6px;
		border: 1px solid #bbf7d0;
		margin-top: 0.75rem;
		font-size: 0.9rem;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
