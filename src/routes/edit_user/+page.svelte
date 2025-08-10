<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	// import UsernameInput from '$lib/components/ui/UsernameInput.svelte';
	import axios from 'axios';

	export let data;
	let form: { error?: string; success?: boolean; message?: string } | null = null;

	let tag = data.u!.t || '';
	let description = data.u!.d || '';
	let age = data.u!.a || 18;
	let gender: 0 | 1 = (data.u!.g ?? 0) as 0 | 1;
	let latitude = data.u!.l || 0;
	let longitude = data.u!.n || 0;
	let socialLinks: string[] = data.u!.x || [];
	let usernameValid = true;

	let isGettingLocation = false;
	let isSubmitting = false;

	// avatar upload (stored as small data url)
	let avatarDataUrl: string = (data.u && (data.u as any).av) || '';
	function onAvatarChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement('canvas');
				const size = 128;
				canvas.width = size;
				canvas.height = size;
				const ctx = canvas.getContext('2d');
				if (!ctx) return;
				// cover-fit crop
				const scale = Math.max(size / img.width, size / img.height);
				const sw = size / scale;
				const sh = size / scale;
				const sx = (img.width - sw) / 2;
				const sy = (img.height - sh) / 2;
				ctx.clearRect(0, 0, size, size);
				ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
				avatarDataUrl = canvas.toDataURL('image/png', 0.9);
			};
			img.src = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

	function handleDescriptionUpdate(event: CustomEvent) {
		description = event.detail.value;
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
				socialLinks,
				avatarDataUrl
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

<main>
	<!-- Background elements -->
	<div class="bg-orb bg-orb-1"></div>
	<div class="bg-orb bg-orb-2"></div>
	<div class="bg-orb bg-orb-3"></div>

	<div class="container-narrow min-h-screen py-8">
		<header class="mb-8 text-center">
			<h1 class="hero-title mb-4">Edit Profile</h1>
			<p class="hero-subtitle">Update your information to improve matching</p>
		</header>

		<div class="card-normal">
			<!-- avatar -->
			<div class="form-group">
				<label class="form-label" for="avatar_input">avatar</label>
				<div class="flex items-center gap-4">
					<div class="h-16 w-16 overflow-hidden rounded-full bg-gray-800">
						{#if avatarDataUrl}
							<img src={avatarDataUrl} alt="avatar preview" class="h-full w-full object-cover" />
						{:else}
							<div class="flex h-full w-full items-center justify-center text-xs text-gray-400">
								no pic
							</div>
						{/if}
					</div>
					<input
						id="avatar_input"
						type="file"
						accept="image/*"
						on:change={onAvatarChange}
						class="input-rect"
					/>
				</div>
				<small class="form-help">square image recommended. we store a tiny 128px copy.</small>
			</div>
			<form on:submit={handleSubmit} class="section-spacing">
				<div class="form-group">
					<label for="tag" class="form-label">user tag</label>
					<input
						type="text"
						name="tag"
						bind:value={tag}
						autocomplete="username"
						class="input-rect w-full border-0"
					/>
				</div>

				<div class="form-group">
					<label for="description" class="form-label"
						>type or record a description of yourself</label
					>
					<div class="glass rounded-lg p-1">
						<DescriptionInput
							bind:value={description}
							maxLength={500}
							autoUpdate={true}
							endpoint="/api/update-description"
							on:update={handleDescriptionUpdate}
						/>
					</div>
					<input type="hidden" name="description" value={description} />
				</div>

				<div class="form-group">
					<label for="age" class="form-label">Age</label>
					<input
						id="age"
						name="age"
						type="number"
						bind:value={age}
						class="input-rect w-full border-0"
						min="18"
						max="120"
						required
					/>
				</div>

				<div class="form-group">
					<span class="form-label" id="gender_label">Gender</span>
					<div class="choice-group">
						<label>
							<input
								aria-labelledby="gender_label"
								type="radio"
								name="gender"
								value={0}
								bind:group={gender}
								class="sr-only"
							/>
							<div class={gender === 0 ? 'choice-btn-active-blue' : 'choice-btn-inactive'}>
								Male
							</div>
						</label>
						<label>
							<input
								aria-labelledby="gender_label"
								type="radio"
								name="gender"
								value={1}
								bind:group={gender}
								class="sr-only"
							/>
							<div class={gender === 1 ? 'choice-btn-active' : 'choice-btn-inactive'}>Female</div>
						</label>
					</div>
				</div>

				<!-- Location -->
				<!-- <div class="form-group">
					<label class="form-label">Location</label>
					<div class="location-container">
						<div class="location-display">
							{#if latitude && longitude}
								<span class="current-location">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
							{:else}
								<span class="no-location">No location set</span>
							{/if}
							<input type="hidden" name="latitude" value={latitude} />
							<input type="hidden" name="longitude" value={longitude} />
						</div>
						<button
							type="button"
							class="location-btn rounded-full"
							on:click={getCurrentLocation}
							disabled={isGettingLocation}
						>
							{#if isGettingLocation}
								<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
									<path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" class="animate-spin" />
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
				</div> -->

				<div class="form-group">
					<span class="form-label" id="social_label">Social Media Links (Optional)</span>
					<div class="mb-3 flex items-center gap-2">
						<button
							type="button"
							on:click={() => (socialLinks = [...socialLinks, ''])}
							class="add-link-btn flex h-8 w-8 items-center justify-center rounded-full"
						>
							+
						</button>
						<small class="form-help">WhatsApp, Telegram or Social media links</small>
					</div>
					{#each socialLinks as link, index (index)}
						<div class="social-link-item">
							<input
								aria-labelledby="social_label"
								type="url"
								bind:value={socialLinks[index]}
								placeholder="Enter social media link"
								class="input-rect flex-1 border-0"
							/>
							<button
								type="button"
								on:click={() => (socialLinks = socialLinks.filter((_, i) => i !== index))}
								class="remove-link-btn flex h-8 w-8 items-center justify-center rounded-full"
							>
								×
							</button>
						</div>
					{/each}
				</div>

				{#if form?.error}
					<div class="error-card rounded-full">
						{form.error}
					</div>
				{/if}

				{#if form?.success}
					<div class="success-card rounded-full">
						{form.message}
					</div>
				{/if}

				<div class="flex justify-center gap-4 pt-4">
					<button type="submit" class="btn-primary btn-lg rounded-full" disabled={isSubmitting}>
						{#if isSubmitting}
							<div class="loading-spinner"></div>
							Saving...
						{:else}
							Save Changes
						{/if}
					</button>
					<a href="/" class="btn-ghost btn-lg rounded-full">Cancel</a>
				</div>
			</form>
		</div>
	</div>
</main>
