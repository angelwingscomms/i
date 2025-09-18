<script lang="ts">
	import axios from 'axios';
	import Button from '$lib/components/Button.svelte';
	let {
		value = $bindable(),
		editable = true,
		endpoint = '/api/transcribe', // Changed default endpoint to transcribe
		placeholder = `beliefs, interests, hobbies, stuff you could talk about for hours...`,
		rows = 6,
		onInput = () => {},
		label,
		ref = $bindable<HTMLTextAreaElement | null>(null)
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
				endpoint,
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
		class="description-textarea border-1"
		{placeholder}
		{rows}
		required
		disabled={!editable || isTranscribing}
		readonly={!editable}
		bind:this={ref}
	></textarea>

	<div class="description-controls">
		{#if editable}
			<div class="voice-controls">
				{#if !isRecording && !isTranscribing}
					<Button
						class="voice-btn rounded-full"
						onclick={startRecording}
						icon="fa-microphone"
						text="voice typing"
					/>
				{:else if isRecording}
					<Button
						class="voice-btn-recording rounded-full"
						onclick={stopRecording}
						icon="fa-circle"
						text="recording"
					/>
				{:else}
					<Button
						type="button"
						class="voice-btn-transcribing rounded-full"
						disabled={true}
						loading={true}
						text="transcribing"
					/>
				{/if}
			</div>
		{/if}
	</div>
</div>