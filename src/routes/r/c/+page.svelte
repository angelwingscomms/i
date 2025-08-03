<script lang="ts">
	import { fade } from 'svelte/transition';
	import { toast } from '$lib/util/toast';
	import { goto } from '$app/navigation';

	let room_tag: string = '';
	let description: string = '';
	let form_errors: { room_tag?: string; description?: string; general?: string } = {};
	let is_loading: boolean = false;

	async function handle_submit() {
		form_errors = {}; // Clear previous errors
		let has_errors = false;

		if (!room_tag.trim()) {
			form_errors.room_tag = 'Room Tag is required.';
			has_errors = true;
		} else if (room_tag.trim().length > 50) {
			form_errors.room_tag = 'Room Tag must be 50 characters or less.';
			has_errors = true;
		}

		if (!description.trim()) {
			form_errors.description = 'Description is required.';
			has_errors = true;
		} else if (description.trim().length > 200) {
			form_errors.description = 'Description must be 200 characters or less.';
			has_errors = true;
		}

		if (has_errors) {
			return;
		}

		is_loading = true;

		try {
			const response = await fetch('/r/c', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ room_tag, description })
			});

			if (response.ok) {
				const data = await response.json();
				toast.success('Room created successfully!');
				await goto(`/r/${data.room_id}`);
			} else if (response.status === 400) {
				const error_data = await response.json();
				form_errors = error_data.errors || { general: 'Invalid input. Please check your fields.' };
				toast.error('Please correct the errors in the form.');
			} else {
				toast.error('Failed to create room. Please try again.');
			}
		} catch (error) {
			console.error('Network error:', error);
			toast.error('Network error. Please try again.');
		} finally {
			is_loading = false;
		}
	}
</script>

<div class="container-narrow" transition:fade>
	<div class="form-card">
		<h1 class="heading-large">Create New Room</h1>
		<form on:submit|preventDefault={handle_submit} class="form-layout">
			<div class="form-group">
				<label for="room_tag" class="form-label">Room Tag</label>
				<input
					type="text"
					id="room_tag"
					bind:value={room_tag}
					class="input-rect"
					placeholder="Enter room tag"
					maxlength="50"
					aria-invalid={!!form_errors.room_tag}
					aria-describedby={form_errors.room_tag ? 'room_tag_error' : undefined}
				/>
				{#if form_errors.room_tag}
					<p id="room_tag_error" class="error-message" transition:fade>{form_errors.room_tag}</p>
				{/if}
			</div>

			<div class="form-group">
				<label for="description" class="form-label">Description</label>
				<textarea
					id="description"
					bind:value={description}
					class="textarea"
					placeholder="Describe your room"
					rows="4"
					maxlength="200"
					aria-invalid={!!form_errors.description}
					aria-describedby={form_errors.description ? 'description_error' : undefined}
				></textarea>
				{#if form_errors.description}
					<p id="description_error" class="error-message" transition:fade>
						{form_errors.description}
					</p>
				{/if}
			</div>

			{#if form_errors.general}
				<p class="error-message general-error" transition:fade>{form_errors.general}</p>
			{/if}

			<button type="submit" class="button-primary" disabled={is_loading}>
				{#if is_loading}
					Creating...
				{:else}
					Create Room
				{/if}
			</button>
		</form>
	</div>
</div>
