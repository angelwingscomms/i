<script lang="ts">
	import axios from 'axios';
	import Button from '$lib/components/Button.svelte';
	let {
		value = $bindable(),
		editable = true,
		placeholder = `beliefs, interests, hobbies, stuff you could talk about for hours...`,
		rows = 6,
		onInput = () => {},
		label,
		ref = $bindable<HTMLTextAreaElement | null>(null),
		send_button = false
	} = $props();

	// Constants
	const maxLength = 500;

	let isRecording = $state(false);
	let isTranscribing = $state(false);
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];

	async function startRecording() {
		try {
			const stream =
				await navigator.mediaDevices.getUserMedia({
					audio: true
				});
			mediaRecorder = new MediaRecorder(stream);
			audioChunks = [];

			mediaRecorder.ondataavailable = (event) => {
				audioChunks.push(event.data);
			};

			mediaRecorder.onstop = async () => {
				const audioBlob = new Blob(audioChunks, {
					type: 'audio/webm'
				});
				await transcribeAudio(audioBlob);
				stream
					.getTracks()
					.forEach((track) => track.stop());
			};

			mediaRecorder.start();
			isRecording = true;
		} catch (error) {
			console.error(
				'Error starting recording:',
				error
			);
			alert('Could not access microphone');
		}
	}

	function stopRecording() {
		if (mediaRecorder && isRecording) {
			mediaRecorder.stop();
			isRecording = false;
			isTranscribing = true;
		}
	}

	async function transcribeAudio(audioBlob: Blob) {
		isTranscribing = true;
		try {
			const formData = new FormData();
			formData.append('audio', audioBlob);

			const response = await axios.post(
				'/api/transcribe',
				formData,
				{
					headers: {
						'Content-Type': 'multipart/form-data'
					}
				}
			);

			if (response.data.text) {
				value += ' ' + response.data.text;
				onInput?.({ value });
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
		<label for="description" class="text-accent"
			>{label}</label
		>
	{/if}
	<textarea
		id="description"
		name="description"
		bind:value
		class="description-textarea border-1 border-l-0 border-b-0"
		{placeholder}
		{rows}
		required
		disabled={!editable || isTranscribing}
		readonly={!editable}
		bind:this={ref}
	></textarea>

	<div class="description-controls">
		{#if editable}
			<div class="voice-controls flex items-center gap-2">
				{#if !isRecording && !isTranscribing}
					<Button
						onclick={startRecording}
						icon="fa-microphone"
						class="h-8 w-8 p-0"
					/>
					{#if send_button}
						<Button
							onclick={() => onInput({ value })}
							icon="fa-paper-plane"
							class="h-8 w-8 p-0"
						/>
					{/if}
				{:else if isRecording}
					<Button
						onclick={stopRecording}
						icon="fa-circle"
						class="h-8 w-8 p-0"
					/>
				{:else}
					<Button
						type="button"
						class="voice-btn-transcribing rounded-full h-8 w-8 p-0"
						disabled={true}
						loading={true}
					/>
				{/if}
			</div>
		{/if}
	</div>
</div>
