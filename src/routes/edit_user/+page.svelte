<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';
	// import UsernameInput from '$lib/components/ui/UsernameInput.svelte';
	import axios from 'axios';

	let {data} = $props();
	let form: {
		error?: string;
		success?: boolean;
		message?: string;
	} | null = $state(null);

	let
		tag = $state(data.u!.t || ''),
		description = $state(data.u!.d || ''),
		ageStr = $state<string>(String(data.u!.a || 18)),
		gender = $state<0 | 1>((data.u!.g ?? 0) as 0 | 1),
		latitude = $state(data.u!.l || 0),
		longitude = $state(data.u!.n || 0),
		socialLinks = $state<string[]>(data.u!.x || []),
		usernameValid = $state(true),
		isGettingLocation = $state(false),
		isSubmitting = $state(false),
		avatarDataUrl = $state((data.u && (data.u as any).av) || ''),
		fileInput: HTMLInputElement | null = null;
	function onAvatarChange(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => {
			const img = new Image();
			img.onload = () => {
				const canvas =
					document.createElement('canvas');
				const size = 128;
				canvas.width = size;
				canvas.height = size;
				const ctx = canvas.getContext('2d');
				if (!ctx) return;
				// cover-fit crop
				const scale = Math.max(
					size / img.width,
					size / img.height
				);
				const sw = size / scale;
				const sh = size / scale;
				const sx = (img.width - sw) / 2;
				const sy = (img.height - sh) / 2;
				ctx.clearRect(0, 0, size, size);
				ctx.drawImage(
					img,
					sx,
					sy,
					sw,
					sh,
					0,
					0,
					size,
					size
				);
				avatarDataUrl = canvas.toDataURL(
					'image/png',
					0.9
				);
			};
			img.src = reader.result as string;
		};
		reader.readAsDataURL(file);
	}


	async function getCurrentLocation() {
		if (!navigator.geolocation) {
			alert(
				'Geolocation is not supported by this browser'
			);
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
			const response = await axios.post(
				'/edit_user',
				{
					tag,
					description,
					age: parseInt(ageStr) || 18,
					gender: +gender,
					latitude,
					longitude,
					socialLinks,
					avatarDataUrl
				}
			);

			if (response.data.success) {
				form = {
					success: true,
					message: response.data.message
				};
			} else {
				form = {
					error:
						response.data.error ||
						'Failed to update profile'
				};
			}
		} catch (error) {
			console.error('Submission error:', error);
			if (axios.isAxiosError(error)) {
				form = {
					error:
						error.response?.data?.error ||
						'An unexpected error occurred.'
				};
			} else {
				form = {
					error: 'An unexpected error occurred.'
				};
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
			<h1 class="hero-title mb-4">edit profile</h1>
			<p class="hero-subtitle">
				update your information to improve matching
			</p>
		</header>

		<div class="card-normal">
			<!-- avatar -->
			<div class="form-group">
				<label class="form-label" for="avatar_input">avatar</label>
				<div class="flex items-center gap-4">
					<div
						class="h-16 w-16 overflow-hidden rounded-full bg-gray-800"
					>
						{#if avatarDataUrl}
							<img
								src={avatarDataUrl}
								alt="avatar preview"
								class="h-full w-full object-cover"
							/>
						{:else}
							<div
								class="flex h-full w-full items-center justify-center text-xs text-gray-400"
							>
								no pic
							</div>
						{/if}
					</div>
					<Button
						text="choose file"
						variant="secondary"
						icon="fa-camera"
						onclick={() => fileInput?.click()}
					/>
					<input
						id="avatar_input"
						bind:this={fileInput}
						type="file"
						accept="image/*"
						onchange={onAvatarChange}
						class="hidden"
					/>
				</div>
				<small class="form-help">square image recommended. we store a tiny 128px copy.</small>
			</div>
			<form
				onsubmit={handleSubmit}
				class="section-spacing"
			>
				<div class="form-group">
					<label for="tag" class="form-label">user tag</label>
					<DescriptionInput
						bind:value={tag}
						type="text"
						placeholder="user tag"
						voice_typing={false}
					/>
					<input type="hidden" name="tag" value={tag} />
				</div>

				<div class="form-group">
					<label for="description" class="form-label">description</label>
					<div class="glass rounded-lg p-1">
						<DescriptionInput
							bind:value={description}
							placeholder="describe yourself"
						/>
					</div>
					<input
						type="hidden"
						name="description"
						value={description}
					/>
				</div>

				<div class="form-group">
					<label for="age" class="form-label">age</label>
					<DescriptionInput
						bind:value={ageStr}
						type="number"
						min={0}
						max={144}
						placeholder="age"
						voice_typing={false}
					/>
					<input type="hidden" name="age" value={ageStr} />
				</div>

				<div class="form-group">
					<span class="form-label" id="gender_label">gender</span>
					<div class="choice-group">
						<Button
							text="male"
							variant="secondary"
							active={gender === 0}
							onclick={(e) => { e.preventDefault(); gender = 0; }}
						/>
						<Button
							text="female"
							variant="secondary"
							active={gender === 1}
							onclick={(e) => { e.preventDefault(); gender = 1; }}
						/>
					</div>
				</div>

				<!-- Location -->
				<div class="form-group">
					<label
						class="form-label"
						for="location_btn"
						id="location_label">location</label
					>
					<div
						class="location-container"
						aria-labelledby="location_label"
					>
						{#if latitude && longitude}
							<div class="location-display">
								<span class="current-location">{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
							</div>
						{/if}
						<input
							type="hidden"
							name="latitude"
							value={latitude}
						/>
						<input
							type="hidden"
							name="longitude"
							value={longitude}
						/>
						<Button
							text="update location"
							loading={isGettingLocation}
							icon="fa-map-marker-alt"
							variant="primary"
							onclick={(e) => {e.preventDefault(); getCurrentLocation();}}
						/>
					</div>
				</div>

				<div class="form-group">
					<span class="form-label" id="social_label">contact/social media links</span>
					<div class="mb-3 flex items-center gap-2">
						<Button
							text="+"
							variant="secondary"
							onclick={() => socialLinks = [...socialLinks, '']}
						/>
						<small class="form-help">whatsapp, telegram or social media links</small>
					</div>
					{#each socialLinks as _, index (index)}
						<div class="social-link-item">
							<DescriptionInput
								bind:value={socialLinks[index]}
								type="url"
								placeholder="enter social media link"
								voice_typing={false}
							/>
							<Button
								text="×"
								variant="secondary"
								onclick={() => socialLinks = socialLinks.filter((_, i) => i !== index)}
							/>
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
					<Button
						text="save changes"
						loading={isSubmitting}
						variant="primary"
						wide={true}
					/>
					<Button
						href={`/u/${data.u.i}`}
						text="view profile"
						target="_blank"
						variant="secondary"
					/>
					<Button
						href="/"
						text="cancel"
						variant="secondary"
						wide={true}
					/>
				</div>
			</form>
		</div>
	</div>
</main>
