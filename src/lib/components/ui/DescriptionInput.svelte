<script lang="ts">
	import axios from 'axios';
	import type { DescriptionInputProps } from '$lib/types';

	let {
		value = $bindable(''),
		editable = true,
		endpoint = '/api/update-description',
		placeholder = `beliefs, interests, hobbies, stuff you could talk about for hours...`,
		rows = 6,
		onUpdate,
		onInput,
		label
	}: DescriptionInputProps = $props();

	// Constants
	const maxLength = 500;
	const autoUpdate = false;

	let originalValue = value;
	let isSaving = false;
	let error = '';
	let success = '';
	let isRecording = false;
	let isTranscribing = false;
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let charCount = value.length;
	let textareaRef: HTMLTextAreaElement;

	$effect(() => {
		// Update char count when value changes
		charCount = value?.length || 0;

		// Auto-resize textarea
		if (textareaRef) {
			textareaRef.style.height = 'auto';
			textareaRef.style.height = textareaRef.scrollHeight + 'px';
		}
	});

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
				onUpdate?.({ value, success: true });
				return true;
			} else {
				error = response.data.error || 'Failed to update description';
				onUpdate?.({ value, success: false, error });
				return false;
			}
		} catch (err: any) {
			error = err.response?.data?.error || 'An error occurred while updating';
			onUpdate?.({ value, success: false, error });
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
				value += ' ' + response.data.text;
				onInput?.({ value });

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
	{#if label}
		<label for="description" class="text-accent">{label}</label>
	{/if}
	<textarea
		id="description"
		name="description"
		bind:value
		class="description-textarea border-1"
		{placeholder}
		required
		disabled={!editable || isSaving || isTranscribing}
		readonly={!editable}
		bind:this={textareaRef}
	></textarea>

	<div class="description-controls">
		<!-- <div class={charCount > maxLength ? 'char-count-over' : 'char-count'}>
			{charCount}/{maxLength}
		</div> -->

		{#if editable}
			<div class="voice-controls">
				{#if !isRecording && !isTranscribing}
					<button type="button" class="voice-btn rounded-full" onclick={startRecording}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path
								d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2M19 12C19 16.2 15.8 19.2 12 19.2S5 16.2 5 12H7C7 15.1 9.5 17.6 12 17.6S17 15.1 17 12H19Z"
							/>
						</svg>
						use voice typing
					</button>
				{:else if isRecording}
					<button type="button" class="voice-btn-recording rounded-full" onclick={stopRecording}>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M6 6H18V18H6V6Z" />
						</svg>
						Stop Recording
					</button>
				{:else}
					<button type="button" class="voice-btn-transcribing rounded-full" disabled>
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

			<!-- {#if !autoUpdate}
				<button
					type="button"
					class="update-btn"
					onclick={updateDescription}
					disabled={isSaving || value === originalValue}
				>
					{isSaving ? 'Saving...' : 'Update'}
				</button>
			{/if} -->
		{/if}
	</div>

	{#if error}
		<div class="error-card mt-3 rounded-full">
			{error}
		</div>
	{/if}

	{#if success}
		<div class="success-card mt-3 rounded-full">
			{success}
		</div>
	{/if}
</div>
