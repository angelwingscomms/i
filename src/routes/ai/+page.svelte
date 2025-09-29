<script lang="ts">
	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];
	let isRecording = false;
	let stream: MediaStream | null = null;
	let selectedVoice = 'Fritz-PlayAI';
	let temperature = 0.7;
	let topP = 0.8;
	let maxTokens = 200;
	let frequencyPenalty = 0;
	let presencePenalty = 0;

	async function toggleRecording() {
		const recordBtn = document.getElementById(
			'record-btn'
		) as HTMLButtonElement;
		const recordText = document.getElementById(
			'record-text'
		) as HTMLSpanElement;
		const status = document.getElementById(
			'status'
		) as HTMLParagraphElement;

		if (!isRecording) {
			try {
				stream =
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
						type: 'audio/wav'
					});
					await processAudio(audioBlob);
					if (stream) {
						stream
							.getTracks()
							.forEach((track) => track.stop());
					}
				};

				mediaRecorder.start();
				isRecording = true;
				recordText.textContent = 'stop recording';
				recordBtn.classList.add(
					'bg-red-500',
					'hover:bg-red-600'
				);
				recordBtn.classList.remove(
					'bg-[var(--color-theme-1)]',
					'hover:bg-[var(--color-theme-1-hover)]'
				);
				status.textContent = 'recording... speak now';
			} catch (error) {
				console.error(
					'Error accessing microphone:',
					error
				);
				status.textContent =
					'microphone access denied';
			}
		} else {
			if (mediaRecorder) {
				mediaRecorder.stop();
			}
			isRecording = false;
			recordText.textContent = 'start recording';
			recordBtn.classList.remove(
				'bg-red-500',
				'hover:bg-red-600'
			);
			recordBtn.classList.add(
				'bg-[var(--color-theme-1)]',
				'hover:bg-[var(--color-theme-1-hover)]'
			);
			status.textContent = 'processing...';
		}
	}

	async function processAudio(audioBlob: Blob) {
		const status = document.getElementById(
			'status'
		) as HTMLParagraphElement;
		const responseAudio = document.getElementById(
			'response-audio'
		) as HTMLAudioElement;

		try {
			status.textContent = 'sending audio...';

			const formData = new FormData();
			formData.append(
				'audio',
				audioBlob,
				'recording.wav'
			);
			formData.append('voice', selectedVoice);
			formData.append(
				'temperature',
				temperature.toString()
			);
			formData.append('topP', topP.toString());
			formData.append(
				'maxTokens',
				maxTokens.toString()
			);
			formData.append(
				'frequencyPenalty',
				frequencyPenalty.toString()
			);
			formData.append(
				'presencePenalty',
				presencePenalty.toString()
			);

			const response = await fetch('/ai/process', {
				method: 'POST',
				body: formData
			});

			if (!response.ok) {
				throw new Error(
					`HTTP error! status: ${response.status}`
				);
			}

			status.textContent = 'playing response...';

			const audioBlobResponse = await response.blob();
			const audioUrl = URL.createObjectURL(
				audioBlobResponse
			);
			responseAudio.src = audioUrl;
			responseAudio.play();

			status.textContent = 'ready to record';
		} catch (error) {
			console.error('Error processing audio:', error);
			status.textContent = 'error processing audio';
		}
	}
</script>

<svelte:head>
	<title>ai voice chat</title>
	<meta
		name="description"
		content="talk to ai with your voice. get instant responses."
	/>
</svelte:head>

<section
	class="flex min-h-screen flex-col items-center justify-center px-4 pt-16 text-center"
>
	<div class="max-w-2xl">
		<h1 class="hero-title mb-4">ai voice chat</h1>
		<p class="hero-subtitle mb-8">
			speak to ai and get voice responses. powered by
			groq.
		</p>

		<div
			class="mb-8 rounded-lg border border-[var(--border-primary)] bg-[var(--bg-secondary)] p-8"
		>
			<div class="mb-6">
				<label
					for="voice-select"
					class="mb-2 block text-sm font-medium text-[var(--text-primary)]"
					>Select Voice</label
				>
				<select
					id="voice-select"
					bind:value={selectedVoice}
					class="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-4 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-theme-1)] focus:outline-none"
				>
					<option value="Fritz-PlayAI">Fritz</option>
					<option value="Charlotte-PlayAI"
						>Charlotte</option
					>
					<option value="Dylan-PlayAI">Dylan</option>
					<option value="Susan-PlayAI">Susan</option>
					<option value="Navya-PlayAI">Navya</option>
					<option value="Benton-PlayAI">Benton</option
					>
					<option value="Olivia-PlayAI">Olivia</option
					>
					<option value="Adolfo-PlayAI">Adolfo</option
					>
					<option value="Arthur-PlayAI">Arthur</option
					>
					<option value="Larry-PlayAI">Larry</option>
					<option value="Oliver-PlayAI">Oliver</option
					>
					<option value="William-PlayAI"
						>William</option
					>
					<option value="Ayla-PlayAI">Ayla</option>
					<option value="Aurora-PlayAI">Aurora</option
					>
					<option value="Carter-PlayAI">Carter</option
					>
					<option value="Delilah-PlayAI"
						>Delilah</option
					>
					<option value="Eleanor-PlayAI"
						>Eleanor</option
					>
					<option value="Frederick-PlayAI"
						>Frederick</option
					>
					<option value="Hunter-PlayAI">Hunter</option
					>
					<option value="Julian-PlayAI">Julian</option
					>
					<option value="Micah-PlayAI">Micah</option>
					<option value="Nova-PlayAI">Nova</option>
					<option value="Phoebe-PlayAI">Phoebe</option
					>
					<option value="Samuel-PlayAI">Samuel</option
					>
					<option value="Theodore-PlayAI"
						>Theodore</option
					>
				</select>
			</div>

			<div class="mb-6">
				<h3
					class="mb-4 text-lg font-medium text-[var(--text-primary)]"
				>
					Qwen3 Hyperparameters
				</h3>
				<div class="grid grid-cols-2 gap-4">
					<div>
						<label
							for="temperature"
							class="mb-1 block text-sm font-medium text-[var(--text-primary)]"
							>Temperature</label
						>
						<input
							id="temperature"
							type="number"
							min="0"
							max="2"
							step="0.1"
							bind:value={temperature}
							class="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-theme-1)] focus:outline-none"
						/>
					</div>
					<div>
						<label
							for="topP"
							class="mb-1 block text-sm font-medium text-[var(--text-primary)]"
							>Top P</label
						>
						<input
							id="topP"
							type="number"
							min="0"
							max="1"
							step="0.1"
							bind:value={topP}
							class="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-theme-1)] focus:outline-none"
						/>
					</div>

					<div>
						<label
							for="maxTokens"
							class="mb-1 block text-sm font-medium text-[var(--text-primary)]"
							>Max Tokens</label
						>
						<input
							id="maxTokens"
							type="number"
							min="1"
							max="1000"
							bind:value={maxTokens}
							class="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-theme-1)] focus:outline-none"
						/>
					</div>
					<div>
						<label
							for="frequencyPenalty"
							class="mb-1 block text-sm font-medium text-[var(--text-primary)]"
							>Frequency Penalty</label
						>
						<input
							id="frequencyPenalty"
							type="number"
							min="-2"
							max="2"
							step="0.1"
							bind:value={frequencyPenalty}
							class="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-theme-1)] focus:outline-none"
						/>
					</div>
					<div>
						<label
							for="presencePenalty"
							class="mb-1 block text-sm font-medium text-[var(--text-primary)]"
							>Presence Penalty</label
						>
						<input
							id="presencePenalty"
							type="number"
							min="-2"
							max="2"
							step="0.1"
							bind:value={presencePenalty}
							class="w-full rounded-lg border border-[var(--border-primary)] bg-[var(--bg-primary)] px-3 py-2 text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--color-theme-1)] focus:outline-none"
						/>
					</div>
				</div>
			</div>

			<div class="mb-6">
				<button
					id="record-btn"
					class="mb-4 rounded-lg bg-[var(--color-theme-1)] px-8 py-4 font-medium text-white transition-colors duration-200 hover:bg-[var(--color-theme-1-hover)]"
					on:click={toggleRecording}
				>
					<span id="record-text">start recording</span
					>
					<i class="fa fa-microphone ml-2"></i>
				</button>
			</div>

			<div class="mb-6">
				<p
					id="status"
					class="text-[var(--text-secondary)]"
				>
					ready to record
				</p>
			</div>

			<div class="mb-6">
				<audio
					id="response-audio"
					controls
					class="w-full max-w-md"
				></audio>
			</div>

			<div
				class="text-sm text-[var(--text-tertiary)]"
			>
				click to start recording, speak your message,
				then click again to send and get ai response.
			</div>
		</div>
	</div>
</section>
