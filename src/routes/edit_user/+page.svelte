<script lang="ts">
	import { enhance } from '$app/forms';
	import axios from 'axios';

	export let data;
	export let form;

	let tag = data.user.t || '';
	let description = data.user.d || '';
	let age = data.user.a || 18;
	let gender = data.user.g || 0;
	let latitude = data.user.l || 0;
	let longitude = data.user.n || 0;
	let whatsappLink = data.user.w || '';

	let isRecording = false;
	let isTranscribing = false;
	let isGettingLocation = false;
	let isSubmitting = false;

	let mediaRecorder: MediaRecorder | null = null;
	let audioChunks: Blob[] = [];

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
				description = response.data.text;
			}
		} catch (error) {
			console.error('Transcription error:', error);
			alert('Failed to transcribe audio');
		} finally {
			isTranscribing = false;
		}
	}

	async function getCurrentLocation() {
		if (!navigator.geolocation) {
			alert('Geolocation is not supported by this browser');
			return;
		}

		isGettingLocation = true;

		navigator.geolocation.getCurrentPosition(
			(position) => {
				latitude = position.coords.latitude;
				longitude = position.coords.longitude;
				isGettingLocation = false;
			},
			(error) => {
				console.error('Geolocation error:', error);
				alert('Could not get your location');
				isGettingLocation = false;
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0
			}
		);
	}

	function handleSubmit() {
		isSubmitting = true;
		return async ({ update }) => {
			await update();
			isSubmitting = false;
		};
	}
</script>

<div class="container">
	<header class="header">
		<h1>Edit Profile</h1>
		<p>Update your information to improve matching</p>
	</header>

	<div class="edit-form">
		<form method="POST" use:enhance={handleSubmit}>
			<div class="form-group">
				<label for="tag" class="form-label">Tag/Username</label>
				<input
					id="tag"
					name="tag"
					type="text"
					bind:value={tag}
					class="form-input"
					placeholder="Enter your unique tag"
					required
				/>
			</div>

			<div class="form-group">
				<label for="description" class="form-label">Description</label>
				<div class="description-container">
					<textarea
						id="description"
						name="description"
						bind:value={description}
						class="form-textarea"
						placeholder="Tell us about yourself, your interests, what you're looking for..."
						rows="6"
						required
					></textarea>
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
				</div>
			</div>

			<div class="form-group">
				<label for="age" class="form-label">Age</label>
				<input
					id="age"
					name="age"
					type="number"
					bind:value={age}
					class="form-input"
					min="18"
					max="120"
					required
				/>
			</div>

			<div class="form-group">
				<label class="form-label">Gender</label>
				<div class="radio-group">
					<label class="radio-label">
						<input type="radio" name="gender" value="0" bind:group={gender} />
						Male
					</label>
					<label class="radio-label">
						<input type="radio" name="gender" value="1" bind:group={gender} />
						Female
					</label>
				</div>
			</div>

			<div class="form-group">
				<label class="form-label">Location</label>
				<div class="location-container">
					<div class="location-inputs">
						<input
							name="latitude"
							type="number"
							bind:value={latitude}
							class="form-input"
							placeholder="Latitude"
							step="any"
							readonly
						/>
						<input
							name="longitude"
							type="number"
							bind:value={longitude}
							class="form-input"
							placeholder="Longitude"
							step="any"
							readonly
						/>
					</div>
					<button
						type="button"
						class="location-btn"
						on:click={getCurrentLocation}
						disabled={isGettingLocation}
					>
						{#if isGettingLocation}
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"
									style="animation: spin 1s linear infinite;"
								/>
							</svg>
							Getting Location...
						{:else}
							<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M3.05,13H1V11H3.05C3.5,6.83 6.83,3.5 11,3.05V1H13V3.05C17.17,3.5 20.5,6.83 20.95,11H23V13H20.95C20.5,17.17 17.17,20.5 13,20.95V23H11V20.95C6.83,20.5 3.5,17.17 3.05,13M12,5A7,7 0 0,0 5,12A7,7 0 0,0 12,19A7,7 0 0,0 19,12A7,7 0 0,0 12,5Z"
								/>
							</svg>
							Update Location
						{/if}
					</button>
				</div>
			</div>

			<div class="form-group">
				<label for="whatsapp" class="form-label">WhatsApp Link (Optional)</label>
				<input
					id="whatsapp"
					name="whatsapp"
					type="url"
					bind:value={whatsappLink}
					class="form-input"
					placeholder="https://wa.me/your-number"
				/>
				<small class="form-help">Enter your WhatsApp contact link for easy communication</small>
			</div>

			{#if form?.error}
				<div class="error-message">
					{form.error}
				</div>
			{/if}

			{#if form?.success}
				<div class="success-message">
					{form.message}
				</div>
			{/if}

			<div class="form-actions">
				<button type="submit" class="save-btn" disabled={isSubmitting}>
					{isSubmitting ? 'Saving...' : 'Save Changes'}
				</button>
				<a href="/" class="cancel-btn">Cancel</a>
			</div>
		</form>
	</div>
</div>

<style>
	.container {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	.header {
		text-align: center;
		margin-bottom: 2rem;
	}

	.header h1 {
		font-size: 2.5rem;
		color: #2563eb;
		margin-bottom: 0.5rem;
	}

	.header p {
		color: #6b7280;
		font-size: 1.1rem;
	}

	.edit-form {
		background: #f8fafc;
		border-radius: 12px;
		padding: 2rem;
		border: 1px solid #e2e8f0;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-label {
		display: block;
		font-weight: 600;
		color: #374151;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.form-input,
	.form-textarea {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #d1d5db;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.form-help {
		display: block;
		margin-top: 0.25rem;
		font-size: 0.8rem;
		color: #6b7280;
	}

	.form-input:focus,
	.form-textarea:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
	}

	.form-textarea {
		resize: vertical;
		min-height: 120px;
	}

	.description-container {
		position: relative;
	}

	.voice-controls {
		position: absolute;
		bottom: 0.5rem;
		right: 0.5rem;
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

	.radio-group {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.radio-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-size: 0.95rem;
	}

	.radio-label input[type='radio'] {
		margin: 0;
	}

	.location-container {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.location-inputs {
		display: flex;
		gap: 1rem;
	}

	.location-btn {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border: 2px solid #d1d5db;
		border-radius: 8px;
		background: white;
		cursor: pointer;
		transition: all 0.2s;
		align-self: flex-start;
	}

	.location-btn:hover:not(:disabled) {
		border-color: #2563eb;
		background: #f8fafc;
	}

	.location-btn:disabled {
		background: #f3f4f6;
		cursor: not-allowed;
	}

	.error-message {
		background: #fef2f2;
		color: #dc2626;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid #fecaca;
		margin-bottom: 1rem;
	}

	.success-message {
		background: #f0fdf4;
		color: #16a34a;
		padding: 1rem;
		border-radius: 8px;
		border: 1px solid #bbf7d0;
		margin-bottom: 1rem;
	}

	.form-actions {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.save-btn,
	.cancel-btn {
		padding: 0.75rem 2rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		text-decoration: none;
		text-align: center;
	}

	.save-btn {
		background: #2563eb;
		color: white;
		border: none;
	}

	.save-btn:hover:not(:disabled) {
		background: #1d4ed8;
		transform: translateY(-1px);
	}

	.save-btn:disabled {
		background: #9ca3af;
		cursor: not-allowed;
	}

	.cancel-btn {
		background: #f3f4f6;
		color: #374151;
		border: 2px solid #d1d5db;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.cancel-btn:hover {
		background: #e5e7eb;
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

	@media (max-width: 640px) {
		.container {
			padding: 1rem 0.5rem;
		}

		.edit-form {
			padding: 1.5rem;
		}

		.location-inputs {
			flex-direction: column;
		}

		.form-actions {
			flex-direction: column;
		}
	}
</style>
