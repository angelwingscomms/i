<script lang="ts">
	import axios from 'axios';
	import Button from '$lib/components/Button.svelte';
	import { animate } from 'animejs';
	import type { FullAutoFill } from 'svelte/elements';
	let {
		value = $bindable(),
		editable = true,
		disabled = false,
		placeholder = `beliefs, interests, hobbies, stuff you could talk about for hours...`,
		rows = undefined,
		type = 'text',
		min,
		max,
		step,
		voice_typing = true,
		ontranscribe = () => {},
		oninput,
		onfocus,
		onclick,
		onmousedown,
		label,
		id = 'description',
		name = 'description',
		ref = $bindable<
			| HTMLInputElement
			| HTMLTextAreaElement
			| undefined
			| null
		>(),
		send,
		send_loading = false,
		buttons_below = false,
		buttons = undefined,
		autocomplete,
		...rest
	}: {
		value?: string | number | undefined;
		editable?: boolean;
		disabled?: boolean;
		placeholder?: string;
		rows?: number;
		type?: string;
		min?: string | number;
		max?: string | number;
		step?: string | number;
		voice_typing?: boolean;
		ontranscribe?: (
			value: string | undefined
		) => void;
		oninput?: (
			event: Event & {
				currentTarget:
					| HTMLInputElement
					| HTMLTextAreaElement;
			}
		) => void;
		onfocus?: (event: FocusEvent) => void;
		onclick?: (event: MouseEvent) => void;
		onmousedown?: (event: MouseEvent) => void;
		'aria-haspopup'?: 'listbox' | undefined;
		'aria-expanded'?: boolean;
		label?: string;
		id?: string;
		name?: string;
		ref?:
			| HTMLInputElement
			| HTMLTextAreaElement
			| undefined
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
		container.style.borderLeftWidth =
			container.style.borderLeftWidth || '2px';
		container.style.borderStyle =
			container.style.borderStyle || 'solid';
		container.style.borderLeftColor =
			'rgba(248,137,250,0.3)';

		_anim = animate(container, {
			duration: 1440,
			loop: true,
			alternate: true,
			// smooth, soothing fade in/out
			ease: 'easeInOutSine',
			borderLeftColor: [
				'rgba(248,137,250,0.3)',
				'rgba(248,137,250,1)'
			]
		});

		return () => {
			try {
				_anim?.cancel?.();
			} catch {}
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
				const audioFile = new File(
					audioChunks,
					'audio.webm',
					{
						type: 'audio/webm'
					}
				);
				await transcribeAudio(audioFile);
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
			insertPos = ref
				? ref.selectionStart || 0
				: value
					? value?.toString().length
					: 0;
			mediaRecorder.stop();
			isRecording = false;
			isTranscribing = true;
		}
	}

	async function transcribeAudio(audioFile: File) {
		isTranscribing = true;
		let transcribedText = '';
		try {
			const formData = new FormData();
			formData.append('audio', audioFile);

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
				value = value
					? value.toString().slice(0, insertPos) +
						toInsert +
						value.toString().slice(insertPos)
					: toInsert;
				ontranscribe?.(value);
			}
		} catch (error) {
			console.error('Transcription error:', error);
			alert('Failed to transcribe audio');
		} finally {
			isTranscribing = false;
			if (ref && transcribedText) {
				const newPos =
					insertPos + transcribedText.length + 1;
				ref.setSelectionRange(newPos, newPos);
				ref.focus();
			}
		}
	}
</script>

<div
	class="relative flex w-full flex-col items-start gap-1 rounded-none"
>
	{#if label}
		<label for={id} class="text-accent">{label}</label
		>
	{/if}
	<div
		bind:this={container}
		class="flex w-full {buttons_below
			? 'flex-col items-start'
			: 'flex-row items-start gap-2'} rounded-none border-l-1"
		style="border-left-color: var(--color-theme-6)"
	>
		{#if rows}
			<textarea
				{id}
				{name}
				bind:value
				class="min-h-[120px] rounded-none border-0 bg-transparent px-4 py-3 font-light text-[var(--text-primary)] transition-all duration-300 placeholder:text-[rgba(248,137,250,0.6)] focus:ring-0 focus:outline-none {buttons_below
					? ''
					: 'flex-1'} appearance-none [::-webkit-clear-button]:hidden"
				{placeholder}
				{rows}
				required
				disabled={disabled ||
					!editable ||
					isTranscribing}
				readonly={!editable}
				bind:this={ref}
				{oninput}
				{...rest}
			></textarea>
		{:else}
			<input
				{type}
				{min}
				{max}
				{step}
				{id}
				{name}
				bind:value
				{autocomplete}
				class="rounded-none border-0 bg-transparent px-4 py-3 font-light text-[var(--text-primary)] transition-all duration-300 placeholder:text-[rgba(248,137,250,0.6)] focus:ring-0 focus:outline-none {buttons_below
					? ''
					: 'flex-1'} appearance-none bg-transparent [::-webkit-clear-button]:hidden [::-webkit-search-cancel-button]:hidden"
				{placeholder}
				required
				disabled={disabled ||
					!editable ||
					isTranscribing}
				readonly={!editable}
				bind:this={ref}
				{oninput}
				{...rest}
			/>
		{/if}
		<div
			class="mt-2 flex flex-shrink-0 items-center justify-between"
		>
			{#if editable}
				<div class="flex items-center gap-2">
					{#if !isRecording && !isTranscribing}
						{#if voice_typing}
							<Button
								onclick={startRecording}
								icon="fa-microphone"
								type="button"
							/>
						{/if}
						{#if send}
							<Button
								onclick={() => send(value)}
								icon={send_loading
									? 'fa-spinner'
									: 'fa-paper-plane'}
								loading={send_loading}
								disabled={send_loading}
								type="button"
							/>
						{/if}
					{:else if isRecording}
						<Button
							onclick={stopRecording}
							icon="fa-circle"
							type="button"
						/>
					{:else}
						<Button
							icon="fa-spinner"
							disabled={true}
							loading={true}
							type="button"
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
								type="button"
							/>
						{/each}
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>
