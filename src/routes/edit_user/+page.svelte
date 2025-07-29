<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	// import UsernameInput from '$lib/components/ui/UsernameInput.svelte';
	import PhoneInput from '$lib/components/ui/PhoneInput.svelte';
	import axios from 'axios';

	export let data;
	let form: { error?: string; success?: boolean; message?: string } | null = null;

	let tag = data.u!.t || '';
	let description = data.u!.d || '';
	let age = data.u!.a || 18;
	let gender = !!data.u!.g;
	let latitude = data.u!.l || 0;
	let longitude = data.u!.n || 0;
	let whatsappLink = data.u!.w || '';
	let usernameValid = true;

	let isGettingLocation = false;
	let isSubmitting = false;

	function handleDescriptionUpdate(event: CustomEvent) {
		description = event.detail.value;
	}

	function handleUsernameValidation(event: CustomEvent) {
		usernameValid = event.detail.isValid;
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

	async function handleSubmit(event: Event) {
		event.preventDefault(); // Prevent default form submission

		if (!usernameValid) {
			form = { error: 'Username is not valid' };
			return;
		}

		isSubmitting = true;
		form = null; // Clear previous messages

		try {
			const response = await axios.post('/edit_user', {
				tag,
				description,
				age,
				gender: +gender,
				latitude,
				longitude,
				whatsapp: whatsappLink
			});

			if (response.data.success) {
				form = { success: true, message: response.data.message };
			} else {
				form = { error: response.data.error || 'Failed to update profile' };
			}
		} catch (error) {
			console.error('Submission error:', error);
			if (axios.isAxiosError(error)) {
				form = { error: error.response?.data?.error || 'An unexpected error occurred.' };
			} else {
				form = { error: 'An unexpected error occurred.' };
			}
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="container">
	<header class="header">
		<h1>Edit Profile</h1>
		<p>Update your information to improve matching</p>
	</header>

	<div class="edit-form">
		<form on:submit={handleSubmit}>
			<div class="form-group">
				<label for="tag" class="form-label">user tag</label>
				<div class="username-input-container">
					<div class="input-wrapper">
						<input type="text" name={tag} bind:value={tag} autocomplete="username" />
						<!-- <UsernameInput
					bind:value={tag}
					initiallyValid={true}
					on:validation={handleUsernameValidation}
				/> -->
					</div>
				</div>
			</div>

			<div class="form-group">
				<label for="description" class="form-label">type or record a description of yourself</label>
				<DescriptionInput
					bind:value={description}
					maxLength={500}
					autoUpdate={true}
					endpoint="/api/update-description"
					on:update={handleDescriptionUpdate}
				/>
				<input type="hidden" name="description" value={description} />
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

			<fieldset class="form-group">
				<input type="checkbox" bind:checked={gender}>
			</fieldset>

			<fieldset class="form-group">
				<legend class="form-label">Location</legend>
				<div class="location-container">
					<div class="location-display">
						{#if latitude && longitude}
							<span class="current-location"
								>{latitude.toFixed(6)}, {longitude.toFixed(6)}</span
							>
						{:else}
							<span class="no-location">No location set</span>
						{/if}
						<input type="hidden" name="latitude" value={latitude} />
						<input type="hidden" name="longitude" value={longitude} />
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
			</fieldset>

			<div class="form-group">
				<label for="whatsapp" class="form-label">WhatsApp number (Optional)</label>
				<PhoneInput
					bind:value={whatsappLink}
					id="whatsapp"
					name="whatsapp"
					required={false}
					formatAsWhatsAppLink={true}
					placeholder="Enter your WhatsApp number"
				/>
				<!-- <small class="form-help">Enter your WhatsApp number for easy communication</small> -->
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

	.form-input {
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

	.form-input:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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

	.location-display {
		padding: 0.75rem;
		background: #f8fafc;
		border-radius: 8px;
		border: 2px solid #d1d5db;
		margin-bottom: 1rem;
	}

	.current-location {
		font-family: monospace;
		color: #374151;
	}

	.no-location {
		color: #6b7280;
		font-style: italic;
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

		.form-actions {
			flex-direction: column;
		}
	}
</style>
