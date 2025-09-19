<script lang="ts">
	import axios from 'axios';
	import Button from '$lib/components/Button.svelte';
	let {
		value = $bindable(),
		editable = true,
		placeholder = `beliefs, interests, hobbies, stuff you could talk about for hours...`,
		rows = undefined,
		ontranscribe = () => {},
		label,
		ref = $bindable<
			HTMLInputElement | HTMLTextAreaElement | null
		>(null),
		send_button = () => {}
	}: {
		value?: string;
		editable?: boolean;
		placeholder?: string;
		rows?: number;
		ontranscribe?: (value: string | undefined) => void;
		label?: string;
		ref?:
			| HTMLInputElement
			| HTMLTextAreaElement
			| null;
		send_button?: (value: string | undefined) => void;
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
				ontranscribe?.(value);
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
	<div
		class="flex w-full flex-col items-start rounded-t-none rounded-b-3xl rounded-br-none border-b-1 border-l-1 p-2"
		style="border-color: var(--color-theme-6)"
	>
		{#if rows}
			<textarea
				id="description"
				name="description"
				bind:value
				class="description-textarea border-0 focus:ring-0 focus:outline-none"
				{placeholder}
				{rows}
				required
				disabled={!editable || isTranscribing}
				readonly={!editable}
				bind:this={ref}
			></textarea>
		{:else}
			<input
				type="text"
				id="description"
				name="description"
				bind:value
				class="description-textinput border-0 focus:ring-0 focus:outline-none"
				{placeholder}
				required
				disabled={!editable || isTranscribing}
				readonly={!editable}
				bind:this={ref}
			/>
		{/if}
		<div class="description-controls flex-shrink-0">
			{#if editable}
				<div
					class="voice-controls flex items-center gap-2"
				>
					{#if !isRecording && !isTranscribing}
						<Button
							onclick={startRecording}
							icon="fa-microphone"
						/>
						{#if send_button}
							<Button
								onclick={() => send_button(value)}
								icon="fa-paper-plane"
							/>
						{/if}
					{:else if isRecording}
						<Button
							onclick={stopRecording}
							icon="fa-circle"
						/>
					{:else}
						<Button
							icon="fa-spinner"
							disabled={true}
							loading={true}
						/>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</div>
