<script lang="ts">
	import axios from 'axios';
	import Button from '$lib/components/Button.svelte';
	import { animate } from 'animejs';
	import type { FullAutoFill } from 'svelte/elements';
	let {
		value = $bindable(''),
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
		id = 'description',
		name = 'description',
		ref = $bindable<
			HTMLInputElement | HTMLTextAreaElement | null
		>(null),
		send,
		send_loading = false,
		buttons_below = false,
		buttons = undefined,
		autocomplete,
		...rest
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
		id?: string;
		name?: string;
		ref?:
			| HTMLInputElement
			| HTMLTextAreaElement
			| null;
		send?: Function;
		send_loading?: boolean;
		buttons_below?: boolean;
		buttons?: {
			icon_classes?: string;
			text?: string;
			send?: () => void;
			loading?: boolean;
		}[];
		autocomplete?: FullAutoFill;
	} = $props();

	// Constants
	const maxLength = 500;

	let isRecording = $state(false);
	let isTranscribing = $state(false);
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let insertPos = $state(0);

	let container: HTMLDivElement | null = null;
	let _anim: any;

	$effect(() => {
		if (!container) return;
		// ensure left border is present and right is not
		container.style.borderRightWidth = '0px';
		container.style.borderLeftWidth = container.style.borderLeftWidth || '2px';
		container.style.borderStyle = container.style.borderStyle || 'solid';
		container.style.borderLeftColor = 'rgba(248,137,250,0.3)';

		_anim = animate(container, {
			duration: 1440,
			loop: true,
			alternate: true,
			// smooth, soothing fade in/out
			ease: 'easeInOutSine',
			borderLeftColor: ['rgba(248,137,250,0.3)', 'rgba(248,137,250,1)']
		});

		return () => {
			try { _anim?.cancel?.(); } catch {}
		};
	});

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
		<label for={id} class="text-accent"
			>{label}</label
		>
	{/if}
	<div
		bind:this={container}
		class="flex w-full {buttons_below ? 'flex-col items-start' : 'flex-row items-start gap-2'} border-l-1"
		style="border-left-color: var(--color-theme-6)"
	>
		{#if rows}
			<textarea
				id={id}
				name={name}
				bind:value
				class="description-textarea border-0 focus:ring-0 focus:outline-none placeholder:text-[rgba(248,137,250,0.6)] {buttons_below ? '' : 'flex-1'} appearance-none [::-webkit-clear-button]:hidden"
				{placeholder}
				{rows}
				required
				disabled={!editable || isTranscribing}
				readonly={!editable}
				bind:this={ref}
				{...rest}
			></textarea>
		{:else}
			<input
				type={type}
				min={min}
				max={max}
				step={step}
				id={id}
				name={name}
				bind:value
				autocomplete={autocomplete}
				
				class="description-textinput border-0 focus:ring-0 focus:outline-none placeholder:text-[rgba(248,137,250,0.6)] {buttons_below ? '' : 'flex-1'} appearance-none [::-webkit-clear-button]:hidden bg-transparent"
				{placeholder}
				required
				disabled={!editable || isTranscribing}
				readonly={!editable}
				bind:this={ref}
				{...rest}
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
								loading={send_loading}
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
			{#if buttons?.length}
				<div class="flex items-center gap-2">
					{#each buttons as btn}
						<Button
							onclick={btn.send}
							icon={btn.icon_classes}
							loading={btn.loading}
							disabled={btn.loading}
						/>
					{/each}
				</div>
			{/if}
			{/if}
		</div>
	</div>
</div>