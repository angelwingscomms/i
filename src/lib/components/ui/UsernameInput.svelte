<script lang="ts">
	import axios from 'axios';
	import { debounce } from '$lib/util/debounce';

	let {
		value = '',
		id = 'username',
		name = 'tag',
		required = true,
		disabled = false,
		placeholder = 'Enter your unique tag',
		minLength = 3,
		maxLength = 30,
		validationEndpoint = '/api/validate-username',
		initiallyValid = false,
		onValidation,
		onInput
	}: {
		value?: string;
		id?: string;
		name?: string;
		required?: boolean;
		disabled?: boolean;
		placeholder?: string;
		minLength?: number;
		maxLength?: number;
		validationEndpoint?: string;
		initiallyValid?: boolean;
		onValidation?: (detail: any) => void;
		onInput?: (detail: any) => void;
	} = $props();

	let isValidating = false;
	let isValid = initiallyValid;
	let error = '';
	let touched = false;
	let lastValidatedValue = '';

	// Use debounce to avoid too many API calls while typing
	const debouncedValidate = debounce(validateUsername, 300);

	async function validateUsername() {
		if (!value || value.length < minLength) {
			error = `Username must be at least ${minLength} characters`;
			isValid = false;
			onValidation?.({ isValid, error });
			return;
		}

		if (value === lastValidatedValue) {
			return; // Don't re-validate the same value
		}

		isValidating = true;
		error = '';

		try {
			const response = await axios.post(validationEndpoint, { username: value });

			if (response.data.valid) {
				isValid = true;
				error = '';
			} else {
				isValid = false;
				error = response.data.error || 'This username is not available';
			}

			lastValidatedValue = value;
			onValidation?.({ isValid, error });
		} catch (err: any) {
			isValid = false;
			error = err.response?.data?.error || 'Unable to validate username';
			onValidation?.({ isValid, error });
		} finally {
			isValidating = false;
		}
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value.trim();

		if (value && value.length >= minLength) {
			debouncedValidate();
		} else {
			isValid = false;
		}

		onInput?.({ value });
	}
</script>

<div class="username-input-container">
	<div class="input-wrapper">
		<input
			type="text"
			{id}
			{name}
			bind:value
			class="username-input {touched ? (isValid ? 'valid' : error ? 'invalid' : '') : ''}"
			{placeholder}
			{disabled}
			{required}
			onblur
			minlength={minLength}
			maxlength={maxLength}
			autocomplete="username"
			oninput={handleInput}
		/>

		{#if touched && value}
			{#if isValidating}
				<div class="validation-icon validating">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"
							style="animation: spin 1s linear infinite;"
						/>
					</svg>
				</div>
			{:else if isValid}
				<div class="validation-icon valid">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
						/>
					</svg>
				</div>
			{:else if error}
				<div class="validation-icon invalid">
					<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
						/>
					</svg>
				</div>
			{/if}
		{/if}
	</div>

	{#if touched && error}
		<div class="error-message">{error}</div>
	{/if}
</div>

<style>
	.username-input-container {
		width: 100%;
	}

	.input-wrapper {
		position: relative;
		width: 100%;
	}

	.username-input {
		width: 100%;
		padding: 0.75rem;
		padding-right: 2.5rem;
		border: 2px solid #d1d5db;
		border-radius: 8px;
		font-size: 1rem;
		transition: all 0.2s;
	}

	.username-input:focus {
		outline: none;
		border-color: #2563eb;
		box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
	}

	.username-input.valid {
		border-color: #16a34a;
	}

	.username-input.invalid {
		border-color: #dc2626;
	}

	.validation-icon {
		position: absolute;
		right: 12px;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
	}

	.validation-icon.validating {
		color: #6b7280;
	}

	.validation-icon.valid {
		color: #16a34a;
	}

	.validation-icon.invalid {
		color: #dc2626;
	}

	.error-message {
		color: #dc2626;
		font-size: 0.85rem;
		margin-top: 0.5rem;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}
		100% {
			transform: rotate(360deg);
		}
	}
</style>
