<script lang="ts">
	import DescriptionInput from '$lib/components/ui/DescriptionInput.svelte';
	import Button from '$lib/components/Button.svelte';
	// import UsernameInput from '$lib/components/ui/UsernameInput.svelte';
	import axios from 'axios';
	import { toast } from '$lib/util/toast.svelte';
	import {
		sanitize_email_list,
		sanitize_phone_list,
		validate_email,
		normalize_phone
	} from '$lib/util/users/contact';
	import { goto } from '$app/navigation';

	let { data } = $props();
	let form: {
		error?: string;
		success?: boolean;
		message?: string;
	} | null = $state(null);

	let tag = $state(data.u!.t || ''),
		name_value = $state(data.u!.m || ''),
		description = $state(data.u!.d || ''),
		ageStr = $state<string>(String(data.u!.a || 18)),
		gender = $state<0 | 1>((data.u!.g ?? 0) as 0 | 1),
		latitude = $state(data.u!.l || 0),
		longitude = $state(data.u!.n || 0),
		zones = $state<string[]>(data.u!.z || []),
		contactLinks = $state<Record<string, string>>(
			(data.u!.x as Record<string, string>) || {}
		),
		phones = $state<string[]>(
			Array.isArray((data.u as any).b)
				? (data.u as any).b
				: []
		),
		emails = $state<string[]>(
			Array.isArray((data.u as any).k)
				? (data.u as any).k
				: []
		),
		primaryEmail = $state(data.u!.e || ''),
		usernameValid = $state(true),
		isGettingLocation = $state(false),
		isSubmitting = $state(false),
		avatarDataUrl = $state(
			(data.u && (data.u as any).av) || ''
		),
		show_age = $state(Boolean((data.u as any).y)),
		show_gender = $state(Boolean((data.u as any).o)),
		show_email = $state(
			Boolean((data.u as any).ke || false)
		),
		fileInput: HTMLInputElement | null = null,
		phone_entry = $state(''),
		email_entry = $state(''),
		link_name = $state(''),
		link_url = $state('');

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

		const name_clean = name_value.trim();

		if (
			primaryEmail.trim() !== '' &&
			!validate_email(primaryEmail)
		) {
			form = { error: 'email is not valid' };
			return;
		}

		const uniquePhones = sanitize_phone_list(phones);
		if (
			phones.length &&
			uniquePhones.length !== phones.length
		) {
			form = { error: 'phone number is not valid' };
			return;
		}

		const uniqueEmails = sanitize_email_list(emails);
		if (
			emails.length &&
			uniqueEmails.length !== emails.length
		) {
			form = { error: 'email is not valid' };
			return;
		}

		isSubmitting = true;
		form = null; // Clear previous messages

		try {
			const response = await axios.post(
				'/~/edit_user',
				{
					tag,
					m: name_clean,
					description,
					age: parseInt(ageStr) || 18,
					gender: +gender,
					latitude,
					longitude,
					contactLinks,
					avatarDataUrl,
					email: primaryEmail,
					b: uniquePhones,
					k: uniqueEmails,
					y: show_age,
					o: show_gender,
					ke: show_email
				}
			);

			if (response.data.success) {
				toast.success(response.data.message);
				form = {
					success: true,
					message: response.data.message
				};
			} else {
				toast.error(
					response.data.error ||
						'Failed to update profile'
				);
				form = {
					error:
						response.data.error ||
						'Failed to update profile'
				};
			}
		} catch (error) {
			console.error('Submission error:', error);
			const errorMessage = axios.isAxiosError(error)
				? error.response?.data?.error ||
					'An unexpected error occurred.'
				: 'An unexpected error occurred.';

			toast.error(errorMessage);
			form = { error: errorMessage };
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
		</header>

		<div class="card-normal">
			<div class="form-group">
				<label for="name" class="form-label"
					>name</label
				>
				<DescriptionInput
					bind:value={name_value}
					type="text"
					id="name"
					name="name"
					placeholder="enter name"
					voice_typing={false}
				/>
			</div>
			<div class="form-group">
				<label for="email" class="form-label"
					>email</label
				>
				<DescriptionInput
					bind:value={primaryEmail}
					type="email"
					id="email"
					name="email"
					placeholder="enter email"
					voice_typing={false}
				/>
				{#if primaryEmail.trim() !== ''}
					<input
						type="hidden"
						name="email"
						value={primaryEmail}
					/>
				{/if}
				{#if primaryEmail.trim() === ''}
					<p class="form-help" aria-live="polite">
						Leaving email blank means you won't be
						able to recover your account if you forget
						your password.
					</p>
				{/if}
			</div>

			<div class="form-group">
				<span class="form-label" id="phones-label"
					>phone numbers</span
				>
				{#if phones.length}
					<ul
						class="space-y-2"
						aria-labelledby="phones-label"
					>
						{#each phones as phone (phone)}
							<li
								class="flex items-center justify-between rounded border border-[var(--border)] px-3 py-2 text-sm"
							>
								<span class="truncate">{phone}</span>
								<Button
									text="remove"
									variant="secondary"
									onclick={() => {
										phones = phones.filter(
											(value) => value !== phone
										);
									}}
								/>
							</li>
						{/each}
					</ul>
				{:else}
					<p
						class="text-sm text-[var(--text-secondary)]"
						aria-live="polite"
					>
						no phone numbers yet
					</p>
				{/if}
				<div class="mt-3 grid gap-3">
					<DescriptionInput
						bind:value={phone_entry}
						placeholder="enter phone number"
						voice_typing={false}
					/>
					<div class="flex gap-2">
						<Button
							text="add"
							variant="secondary"
							onclick={() => {
								const value =
									normalize_phone(phone_entry);
								if (!value) return;
								const next = sanitize_phone_list([
									value,
									...phones
								]);
								phones = next;
								phone_entry = '';
							}}
						/>
						<Button
							text="clear"
							variant="secondary"
							onclick={() => {
								phones = [];
								phone_entry = '';
							}}
						/>
					</div>
				</div>
			</div>

			<div class="form-group">
				<span class="form-label" id="emails-label"
					>extra emails</span
				>
				{#if emails.length}
					<ul
						class="space-y-2"
						aria-labelledby="emails-label"
					>
						{#each emails as address (address)}
							<li
								class="flex items-center justify-between rounded border border-[var(--border)] px-3 py-2 text-sm"
							>
								<span class="truncate">{address}</span
								>
								<Button
									text="remove"
									variant="secondary"
									onclick={() => {
										emails = emails.filter(
											(value) => value !== address
										);
									}}
								/>
							</li>
						{/each}
					</ul>
				{:else}
					<p
						class="text-sm text-[var(--text-secondary)]"
						aria-live="polite"
					>
						no extra emails yet
					</p>
				{/if}
				<div class="mt-3 grid gap-3">
					<DescriptionInput
						bind:value={email_entry}
						placeholder="enter email"
						voice_typing={false}
					/>
					<div class="flex gap-2">
						<Button
							text="add"
							variant="secondary"
							onclick={() => {
								const value = sanitize_email_list([
									email_entry
								])[0];
								if (!value) return;
								const next = sanitize_email_list([
									value,
									...emails
								]);
								emails = next;
								email_entry = '';
							}}
						/>
						<Button
							text="clear"
							variant="secondary"
							onclick={() => {
								emails = [];
								email_entry = '';
							}}
						/>
					</div>
				</div>
			</div>

			<!-- avatar -->
			<div class="form-group">
				<label class="form-label" for="avatar_input"
					>avatar</label
				>
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
				<small class="form-help"
					>square image recommended. we store a tiny
					128px copy.</small
				>
			</div>
			<form
				onsubmit={handleSubmit}
				class="section-spacing"
			>
				<div class="form-group">
					<label for="tag" class="form-label"
						>user tag</label
					>
					<DescriptionInput
						bind:value={tag}
						type="text"
						placeholder="user tag"
						voice_typing={false}
					/>
					<input
						type="hidden"
						name="tag"
						value={tag}
					/>
				</div>

				<div class="form-group">
					<label for="description" class="form-label"
						>description</label
					>
					<div class="glass rounded-lg p-1">
						<DescriptionInput
							bind:value={description}
							placeholder="describe yourself"
							rows={4}
						/>
					</div>
					<input
						type="hidden"
						name="description"
						value={description}
					/>
				</div>

				<div class="form-group">
					<label for="age" class="form-label"
						>age</label
					>
					<DescriptionInput
						bind:value={ageStr}
						type="number"
						min={0}
						max={144}
						placeholder="age"
						voice_typing={false}
					/>
					<input
						type="hidden"
						name="age"
						value={ageStr}
					/>
				</div>

				<div class="form-group">
					<span class="form-label"
						>profile visibility</span
					>
					<div class="flex flex-wrap gap-2">
						<Button
							text={`show age: ${show_age ? 'on' : 'off'}`}
							variant="secondary"
							onclick={(e) => {
								e.preventDefault();
								show_age = !show_age;
							}}
						/>
						<Button
							text={`show gender: ${show_gender ? 'on' : 'off'}`}
							variant="secondary"
							onclick={(e) => {
								e.preventDefault();
								show_gender = !show_gender;
							}}
						/>
						<Button
							text={`show email: ${show_email ? 'on' : 'off'}`}
							variant="secondary"
							onclick={(e) => {
								e.preventDefault();
								show_email = !show_email;
							}}
						/>
					</div>
					<input
						type="hidden"
						name="y"
						value={show_age ? '1' : ''}
					/>
					<input
						type="hidden"
						name="o"
						value={show_gender ? '1' : ''}
					/>
					<input
						type="hidden"
						name="ke"
						value={show_email ? '1' : ''}
					/>
				</div>

				<div class="form-group">
					<span class="form-label" id="gender_label"
						>gender</span
					>
					<div class="choice-group">
						<Button
							text="male"
							variant="secondary"
							active={gender === 0}
							onclick={(e) => {
								e.preventDefault();
								gender = 0;
							}}
						/>
						<Button
							text="female"
							variant="secondary"
							active={gender === 1}
							onclick={(e) => {
								e.preventDefault();
								gender = 1;
							}}
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
								<span class="current-location"
									>{latitude.toFixed(6)}, {longitude.toFixed(
										6
									)}</span
								>
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
							onclick={(e) => {
								e.preventDefault();
								getCurrentLocation();
							}}
						/>
					</div>
				</div>

				<div class="form-group">
					<span class="form-label" id="links_label"
						>contact links</span
					>
					<div class="space-y-4">
						<div class="space-y-2">
							<div
								class="flex items-center justify-between"
							>
								<label
									for="links-name"
									class="form-help"
									>add contact link</label
								>
								<Button
									text="+"
									variant="secondary"
									onclick={() => {
										if (link_name.trim() && link_url.trim()) {
											contactLinks[link_name.trim()] = link_url.trim();
											contactLinks = contactLinks;
											link_name = '';
											link_url = '';
										}
									}}
								/>
							</div>
							<div class="grid gap-2">
								<DescriptionInput
									bind:value={link_name}
									id="links-name"
									type="text"
									placeholder="e.g., whatsapp, x, instagram"
									voice_typing={false}
								/>
								<DescriptionInput
									bind:value={link_url}
									type="url"
									placeholder="enter url"
									voice_typing={false}
								/>
							</div>
						</div>
						{#if Object.keys(contactLinks).length > 0}
							<div class="space-y-2">
								<p class="form-help">saved links:</p>
								<ul class="space-y-2">
									{#each Object.entries(contactLinks) as [name, url]}
										<li
											class="flex items-center justify-between rounded border border-[var(--border)] px-3 py-2 text-sm"
										>
											<div class="min-w-0">
												<span class="font-semibold">{name}</span>
												<br />
												<span class="text-xs text-[var(--text-secondary)]">{url}</span>
											</div>
											<Button
												text="×"
												variant="secondary"
												onclick={() => {
													delete contactLinks[name];
													contactLinks = contactLinks;
												}}
											/>
										</li>
									{/each}
								</ul>
							</div>
						{/if}
					</div>
				</div>

				{#if form?.error}
					<div class="error-card rounded-full">
						{form.error}
					</div>
				{/if}

				{#if form?.success}
					<div>
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
						href={`/${data.u.t}`}
						text="view profile"
						variant="secondary"
					/>
					<Button
						href="/~/"
						text="cancel"
						variant="secondary"
						wide={true}
					/>

					<Button
						onclick={async () => {
							await axios.delete('/~/edit_user');
							alert('deleted');
							goto('/');
						}}
						text="delete user"
						wide={true}
					/>
				</div>
			</form>
		</div>
	</div>
</main>
