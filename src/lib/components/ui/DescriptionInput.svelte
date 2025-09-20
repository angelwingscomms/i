<script lang="ts">
	import axios from 'axios';
	import Button from '$lib/components/Button.svelte';
	let {
		value = $bindable(),
		editable = true,
		placeholder = `beliefs, interests, hobbies, stuff you could talk about for hours...`,
		rows = undefined,
		type = "text",
		min,
		max,
		step,
		voice_typing = true,
		ontranscribe = () => {},
		label,
		ref = $bindable<
			HTMLInputElement | HTMLTextAreaElement | null
		>(null),
		send,
		send_loading = false,
		buttons_below = false
	}: {
		value?: string;
		editable?: boolean;
		placeholder?: string;
		rows?: number;
		type?: string;
		min?: string | number;
		max?: string | number;
		step?: string | number;
		voice_typing?: boolean;
		ontranscribe?: (value: string | undefined) => void;
		label?: string;
		ref?:
			| HTMLInputElement
			| HTMLTextAreaElement
			| null;
		send?: (value: string | undefined) => void;
		send_loading?: boolean;
		buttons_below?: boolean;
	} = $props();

	// Constants
	const maxLength = 500;

	let isRecording = $state(false);
	let isTranscribing = $state(false);
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let insertPos = $state(0);

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
			insertPos = ref ? (ref.selectionStart || 0) : value.length;
			mediaRecorder.stop();
			isRecording = false;
			isTranscribing = true;
		}
	}

	async function transcribeAudio(audioBlob: Blob) {
		isTranscribing = true;
		let transcribedText = '';
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
				transcribedText = response.data.text;
				const toInsert = transcribedText + ' ';
				value = value.slice(0, insertPos) + toInsert + value.slice(insertPos);
				ontranscribe?.(value);
			}
		} catch (error) {
			console.error('Transcription error:', error);
			alert('Failed to transcribe audio');
		} finally {
			isTranscribing = false;
			if (ref && transcribedText) {
				const newPos = insertPos + transcribedText.length + 1;
				ref.setSelectionRange(newPos, newPos);
				ref.focus();
			}
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
		class="flex w-full {buttons_below ? 'flex-col items-start' : 'flex-row items-start gap-2'} border-l-1"
		style="border-color: var(--color-theme-6)"
	>
		{#if rows}
			<textarea
				id="description"
				name="description"
				bind:value
				class="description-textarea border-0 focus:ring-0 focus:outline-none placeholder:text-[var(--color-theme-4)] {buttons_below ? '' : 'flex-1'} appearance-none [::-webkit-clear-button]:hidden"
				{placeholder}
				{rows}
				required
				disabled={!editable || isTranscribing}
				readonly={!editable}
				bind:this={ref}
			></textarea>
		{:else}
			<input
				type={type}
				min={min}
				max={max}
				step={step}
				id="description"
				name="description"
				bind:value
				class="description-textinput border-0 focus:ring-0 focus:outline-none placeholder:text-[var(--color-theme-4)] {buttons_below ? '' : 'flex-1'} appearance-none [::-webkit-clear-button]:hidden"
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
						{#if voice_typing}
							<Button
								onclick={startRecording}
								icon="fa-microphone"
							/>
						{/if}
						{#if send}
							<Button
								onclick={() => send(value)}
								icon={send_loading ? "fa-spinner" : "fa-paper-plane"}
								disabled={send_loading}
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
